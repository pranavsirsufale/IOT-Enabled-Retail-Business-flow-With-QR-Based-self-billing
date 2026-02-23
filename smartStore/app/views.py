from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Staff, StaffType, Category, SubCategory, Product
from .serializers import StaffCreateSerializer, StaffTypeSerializer, CategorySerializer, SubCategorySerializer, ProductSerializer
import json
from django.views import View
from django.http import JsonResponse,HttpResponse
from django.contrib.auth import authenticate, login,logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import qrcode
from io import BytesIO
from django.contrib.auth.decorators import login_required
from .models import Cart, Transaction
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response as DRFResponse
from django.db import transaction as db_transaction

class StaffTypeViewSet(ModelViewSet):
    queryset = StaffType.objects.all()
    serializer_class = StaffTypeSerializer
    permission_classes = [IsAdminUser]

class StaffViewSet(ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffCreateSerializer
    permission_classes = [IsAdminUser]

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

class SubCategoryViewSet(ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [IsAuthenticated]

# class ProductViewSet(ModelViewSet):
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer
class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["get"])
    def qr(self, request, pk=None):
        try:
            product = self.get_object()
        except:
            return Response({"error": "Product not found"}, status=404)

        qr = qrcode.make(product.sku)

        buffer = BytesIO()
        qr.save(buffer, format="PNG")

        return HttpResponse(
            buffer.getvalue(),
            content_type="image/png"
        )

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
                return JsonResponse({
                    "status": "success",
                    "message": "Login successful"
                })

            return JsonResponse({
                "status": "error",
                "message": "Invalid credentials"
            }, status=401)

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)


# ============================
# Logout API (OUTSIDE CLASS)
# ============================

@csrf_exempt
def logout_view(request):
    if request.method == "POST":
        logout(request)
        return JsonResponse({"message": "Logged out successfully"})


# ============================
# Current Logged-in User API (OUTSIDE CLASS)
# ============================

@login_required
def current_user(request):
    # Include staff-related info when available. Fall back to Django user flags.
    role = None
    # Consider Django's built-in staff/superuser flags as admin by default
    is_admin = bool(request.user.is_staff or request.user.is_superuser)
    name = request.user.get_full_name() or ""

    try:
        staff = Staff.objects.get(user=request.user)
        role = staff.type.type if staff.type else None
        # If Staff record exists, prefer its isAdmin flag but keep Django flags as fallback
        is_admin = bool(staff.isAdmin) or is_admin
        name = staff.name or name
    except Staff.DoesNotExist:
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


from rest_framework.permissions import IsAuthenticated


class CartDraftView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Return draft cart from session
        cart = request.session.get('cart', [])
        return DRFResponse({"items": cart})

    def post(self, request, *args, **kwargs):
        # Save cart items to user's session (draft cart, does not affect stock)
        try:
            items = request.data.get('items', [])
            request.session['cart'] = items
            request.session.modified = True
            return DRFResponse({"status": "ok"})
        except Exception as e:
            return DRFResponse({"error": str(e)}, status=400)


class TransactionCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data if hasattr(request, 'data') else json.loads(request.body or "{}")
            items = data.get("items", [])

            with db_transaction.atomic():
                cart = Cart.objects.create(user=request.user)
                created = []
                for it in items:
                    pid = it.get("id") or it.get("product")
                    qty = int(it.get("qty", 1))
                    product = Product.objects.select_for_update().get(pk=pid)
                    if product.stock < qty:
                        raise Exception(f"Insufficient stock for product {product.id}")
                    Transaction.objects.create(cart=cart, product=product, quantity=qty)
                    product.stock = product.stock - qty
                    product.save()
                    created.append({"product": product.id, "qty": qty})

            return DRFResponse({"cart": cart.id, "items": created})
        except Product.DoesNotExist:
            return DRFResponse({"error": "Product not found"}, status=404)
        except Exception as e:
            return DRFResponse({"error": str(e)}, status=400)