import json
from io import BytesIO

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import qrcode
from django.contrib.auth import authenticate, login, logout
from django.db import transaction as db_transaction
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from .models import Cart, Category, Product, Staff, StaffType, SubCategory, Transaction
from .serializers import (
    CartSerializer,
    CategorySerializer, 
    ProductSerializer, 
    StaffCreateSerializer,
    StaffTypeSerializer, 
    SubCategorySerializer
)
from .permissions import IsAdminOrStoreManager, IsStaffMemberReadOnly

class StaffTypeViewSet(ModelViewSet):
    queryset = StaffType.objects.all()
    serializer_class = StaffTypeSerializer
    permission_classes = [IsAuthenticated, IsStaffMemberReadOnly]

class StaffViewSet(ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffCreateSerializer
    permission_classes = [IsAuthenticated, IsAdminOrStoreManager]

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsStaffMemberReadOnly]

class SubCategoryViewSet(ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [IsAuthenticated, IsStaffMemberReadOnly]

class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsStaffMemberReadOnly]

    @action(detail=True, methods=["get"])
    def qr(self, request, pk=None):
        # DRF automatically raises a 404 if the object doesn't exist
        product = self.get_object()

        qr_img = qrcode.make(product.sku)
        buffer = BytesIO()
        qr_img.save(buffer, format="PNG")

        return HttpResponse(
            buffer.getvalue(),
            content_type="image/png"
        )


# ============================
# Authentication Views
# ============================

@method_decorator(csrf_exempt, name="dispatch")
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body or "{}")
            username = data.get("username")
            password = data.get("password")

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return JsonResponse({"status": "success", "message": "Login successful"})

            return JsonResponse({"status": "error", "message": "Invalid credentials"}, status=401)

        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)


@csrf_exempt
def logout_view(request):
    if request.method == "POST":
        logout(request)
        return JsonResponse({"message": "Logged out successfully"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    # Consider Django's built-in staff/superuser flags as admin by default
    is_admin = bool(request.user.is_staff or request.user.is_superuser)
    name = request.user.get_full_name() or ""
    role = None

    try:
        # Explicit lookup to enrich role/name for staff users.
        staff = Staff.objects.get(user=request.user)
        role = staff.type.type if staff.type else None
        is_admin = bool(staff.isAdmin) or is_admin
        name = staff.name or name
    except Staff.DoesNotExist:
        pass

    return Response(
        {
            "username": request.user.username,
            "email": request.user.email,
            "name": name,
            "role": role,
            "isAdmin": is_admin,
            "is_staff": bool(request.user.is_staff),
            "is_superuser": bool(request.user.is_superuser),
        }
    )
# @login_required
# def current_user(request):
#     # Consider Django's built-in staff/superuser flags as admin by default
#     is_admin = bool(request.user.is_staff or request.user.is_superuser)
#     name = request.user.get_full_name() or ""
#     role = None

#     try:
#         # Using the reverse relation 'staff_profile' if you applied the model refactor
#         staff = request.user.staff_profile 
#         role = staff.staff_type.name if staff.staff_type else None
#         is_admin = bool(staff.is_admin) or is_admin
#         name = staff.name or name
#     except ObjectDoesNotExist: # Replaced bare except
#         pass

#     return JsonResponse({
#         "username": request.user.username,
#         "email": request.user.email,
#         "name": name,
#         "role": role,
#         "is_admin": is_admin, # Updated to match snake_case standard
#         "is_staff": bool(request.user.is_staff),
#         "is_superuser": bool(request.user.is_superuser),
#     })


# ============================
# Cart & Transaction Views
# ============================

class CartDraftView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        cart = request.session.get('cart', [])
        return Response({"items": cart})

    def post(self, request, *args, **kwargs):
        try:
            # DRF's request.data handles JSON parsing for us
            items = request.data.get('items', [])
            request.session['cart'] = items
            request.session.modified = True
            return Response({"status": "ok"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class TransactionCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # request.data is already parsed by DRF
        items = request.data.get("items", [])
        
        if not items:
            return Response({"error": "No items provided"}, status=400)

        try:
            with db_transaction.atomic():
                # For history keeping (Order), we create a *new* Cart record
                # But we must also CLEAR the active "IoT/Kiosk" cart
                
                # 1. Create the permanent order record
                cart = Cart.objects.create(user=request.user)
                created_items = []
                
                for item in items:
                    pid = item.get("id") or item.get("product")
                    qty = int(item.get("qty", 1))
                    
                    product = Product.objects.select_for_update().get(pk=pid)
                    
                    if product.stock < qty:
                        raise ValueError(f"Insufficient stock for {product.name}. Only {product.stock} left.")
                    
                    Transaction.objects.create(cart=cart, product=product, quantity=qty)
                    product.stock -= qty
                    product.save()
                    
                    created_items.append({"product": product.id, "qty": qty})

            # 2. CLEAR the Shared IoT Cart!
            store_user = get_store_user()
            if store_user:
                # Find the active cart used by scanner
                active_cart = Cart.objects.filter(user=store_user).order_by('-created_at').first()
                if active_cart:
                    # Clear items or delete cart. Deleting cart is cleaner for "new session"
                    # active_cart.transaction_set.all().delete() 
                    active_cart.delete()

            # Clear the session cart (legacy/fallback)
            if 'cart' in request.session:
                del request.session['cart']

            return Response({"cart_id": cart.id, "items": created_items}, status=201)
            
        except Product.DoesNotExist:
            return Response({"error": "One or more products not found"}, status=404)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            return Response({"error": "An unexpected error occurred"}, status=500)

from rest_framework.generics import ListAPIView
class OrderHistoryView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer

    def get_queryset(self):
        # We also prefetch related transactions -> products to avoid N+1 queries
        return Cart.objects.filter(user=self.request.user).prefetch_related(
            "transaction_set", "transaction_set__product"
        ).order_by("-created_at")

# ============================
# IoT Scan API Views
# ============================
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

@method_decorator(csrf_exempt, name='dispatch')
class ScanProductView(View):
    def post(self, request, *args, **kwargs):
        try:
            # Use specific store user (Admin) for IoT cart
            user = get_store_user()
            if not user:
                 return JsonResponse({'error': 'No store user found'}, status=500)
            
            if not request.body:
                return JsonResponse({'error': 'Empty body'}, status=400)
            
            data = json.loads(request.body)
            sku = data.get('sku')
            
            if not sku:
                return JsonResponse({'error': 'SKU is required'}, status=400)

            try:
                product = Product.objects.get(sku=sku)
            except Product.DoesNotExist:
                return JsonResponse({'message': 'Product not found'}, status=404)

            # --- DB Cart Logic ---
            # Use authenticated user or default to first user (Admin/Store)
            # user = request.user if request.user.is_authenticated else get_user_model().objects.first()
            # if not user:
            #      return JsonResponse({'error': 'No user found for cart association'}, status=500)

            # Find latest cart created recently (e.g., last 24h) or create new
            cart = Cart.objects.filter(user=user).order_by('-created_at').first()
            
            # Create new cart if none exists or if it's too old (e.g. > 1 day)
            if not cart or (timezone.now() - cart.created_at > timedelta(days=1)):
                cart = Cart.objects.create(user=user)

            # Check if product already in cart (Transaction)
            transaction_item = Transaction.objects.filter(cart=cart, product=product).first()
            
            if transaction_item:
                transaction_item.quantity += 1
                transaction_item.save()
                
                # Check stock (optional based on requirements)
                # if product.stock < transaction_item.quantity: ...
            else:
                Transaction.objects.create(cart=cart, product=product, quantity=1)

            # Calculate totals from DB
            cart_items = Transaction.objects.filter(cart=cart)
            cart_count = sum(item.quantity for item in cart_items)
            cart_total = sum(item.product.price * item.quantity for item in cart_items)

            # Notify Websocket about the cart update
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'cart_updates',
                {
                    'type': 'cart_message',
                    'message': {'action': 'update'}
                }
            )

            return JsonResponse({
                'status': 'added',
                'product': {
                    'name': product.name,
                    'price': float(product.price)
                },
                'cart_count': cart_count,
                'cart_total': cart_total
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class CartAPIView(View):
    def get(self, request, *args, **kwargs):
        # Use specific store user (Admin) so frontend sees same cart as scanner
        user = get_store_user()
        if not user:
             return JsonResponse({'cart': [], 'cart_count': 0, 'cart_total': 0})

        cart = Cart.objects.filter(user=user).order_by('-created_at').first()
        
        if not cart:
            return JsonResponse({
                'cart': [],
                'cart_count': 0,
                'cart_total': 0
            })

        cart_items = Transaction.objects.filter(cart=cart).select_related('product')
        
        items_data = []
        cart_count = 0
        cart_total = 0
        
        for item in cart_items:
            items_data.append({
                'id': item.product.id,
                'sku': item.product.sku,
                'name': item.product.name,
                'price': float(item.product.price),
                'qty': item.quantity
            })
            cart_count += item.quantity
            cart_total += item.product.price * item.quantity
        
        return JsonResponse({
            'cart': items_data,
            'cart_count': cart_count,
            'cart_total': cart_total
        })


    def post(self, request, *args, **kwargs):
        # Sync frontend cart state to DB
        try:
            # Sync to the shared Store Cart
            user = get_store_user()
            if not user:
                 return JsonResponse({'error': 'User not found'}, status=500)
            
            data = json.loads(request.body)
            items = data.get('items', [])
            
            cart = Cart.objects.filter(user=user).order_by('-created_at').first()
            if not cart:
                cart = Cart.objects.create(user=user)
            
            # Clear existing items and rebuild (simple sync)
            cart.transaction_set.all().delete()
            
            for item in items:
                sku = item.get('sku')
                qty = item.get('qty', 1)
                if sku:
                    try:
                        product = Product.objects.get(sku=sku)
                        Transaction.objects.create(cart=cart, product=product, quantity=qty)
                    except Product.DoesNotExist:
                        pass
            
            # Notify Websocket about the cart update
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'cart_updates',
                {
                    'type': 'cart_message',
                    'message': {'action': 'update'}
                }
            )

            return JsonResponse({'status': 'synced'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

def get_store_user():
    """Helper to get the central store user (Admin) for shared IoT cart operations"""
    User = get_user_model()
    # Prefer a superuser as the store owner/system account
    user = User.objects.filter(is_superuser=True).first()
    if not user:
        user = User.objects.first()
    return user

