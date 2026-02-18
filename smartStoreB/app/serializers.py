from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from .models import Staff, StaffType, Category, SubCategory, Product

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

    @transaction.atomic
    def create(self, validatedData):
        username = validatedData.pop("username")
        password = validatedData.pop("password")
        email = validatedData.get("email")
        user = User.objects.create_user(username=username, password=password, email=email) # create django user
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

