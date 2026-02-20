from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Staff, StaffType, Category, SubCategory, Product
from .serializers import StaffCreateSerializer, StaffTypeSerializer, CategorySerializer, SubCategorySerializer, ProductSerializer
import json
from django.views import View
from django.http import JsonResponse,HttpResponse
from django.contrib.auth import authenticate, login
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import qrcode
from io import BytesIO


class StaffTypeViewSet(ModelViewSet):
    queryset = StaffType.objects.all()
    serializer_class = StaffTypeSerializer
    permission_classes = [IsAdminUser]

class StaffViewSet(ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffCreateSerializer

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class SubCategoryViewSet(ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer

# class ProductViewSet(ModelViewSet):
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer
class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

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