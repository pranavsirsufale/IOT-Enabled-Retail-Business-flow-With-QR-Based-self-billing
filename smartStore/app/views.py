from rest_framework.viewsets import ModelViewSet
from .models import Staff, StaffType, Category, SubCategory, Product
from .serializers import StaffSerializer, StaffTypeSerializer, CategorySerializer, SubCategorySerializer, ProductSerializer

class StaffTypeViewSet(ModelViewSet):
    queryset = StaffType.objects.all()
    serializer_class = StaffTypeSerializer

class StaffViewSet(ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class SubCategoryViewSet(ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer

class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer