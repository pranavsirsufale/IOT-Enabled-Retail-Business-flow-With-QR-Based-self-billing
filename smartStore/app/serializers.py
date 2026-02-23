from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from .models import Staff, StaffType, Category, SubCategory, Product, Cart, Transaction

class StaffTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffType
        fields = "__all__"

# class StaffSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Staff
#         fields = "__all__"

class StaffCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    class Meta:
        model = Staff
        fields = ["username", "password", "name", "type", "isAdmin", "email", "phone"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    @transaction.atomic
    def create(self, validatedData):
        username = validatedData.pop("username")
        password = validatedData.pop("password")
        email = validatedData.get("email")
        is_admin = validatedData.get("isAdmin", False)
        
        user = User.objects.create_user(username=username, password=password, email=email)
        if is_admin:
            user.is_staff = True
            user.is_superuser = True
            user.save()
            
        staff = Staff.objects.create(user=user, **validatedData)
        return staff

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = "__all__"

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = "__all__"


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"

