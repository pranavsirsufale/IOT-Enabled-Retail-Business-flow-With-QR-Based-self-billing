import json
from io import BytesIO

import qrcode
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import transaction as db_transaction
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import action
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

@login_required
def current_user(request):
    # Consider Django's built-in staff/superuser flags as admin by default
    is_admin = bool(request.user.is_staff or request.user.is_superuser)
    name = request.user.get_full_name() or ""
    role = None

    try:
        # Reverting to your original, explicit query. This is safer!
        staff = Staff.objects.get(user=request.user)
        
        # Note: If you do apply the models.py refactor later, you will 
        # need to change these to staff.staff_type.name and staff.is_admin
        role = staff.type.type if staff.type else None
        is_admin = bool(staff.isAdmin) or is_admin
        name = staff.name or name
        
    except Staff.DoesNotExist: # <-- Fixes the NameError, no extra imports needed!
        pass

    return JsonResponse({
        "username": request.user.username,
        "email": request.user.email,
        "name": name,
        "role": role,
        "isAdmin": is_admin, 
        "is_staff": bool(request.user.is_staff),
        "is_superuser": bool(request.user.is_superuser),
  })
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
                cart = Cart.objects.create(user=request.user)
                created_items = []
                
                for item in items:
                    pid = item.get("id") or item.get("product")
                    qty = int(item.get("qty", 1))
                    
                    # Excellent use of select_for_update()!
                    product = Product.objects.select_for_update().get(pk=pid)
                    
                    if product.stock < qty:
                        # Rollback is automatic when an exception is raised inside atomic()
                        raise ValueError(f"Insufficient stock for {product.name}. Only {product.stock} left.")
                    
                    Transaction.objects.create(cart=cart, product=product, quantity=qty)
                    product.stock -= qty
                    product.save()
                    
                    created_items.append({"product": product.id, "qty": qty})

            # Clear the session cart after a successful transaction
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