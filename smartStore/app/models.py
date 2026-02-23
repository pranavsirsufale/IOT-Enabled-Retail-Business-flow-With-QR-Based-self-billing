from django.core.files import File
from django.db import models
from django.contrib.auth.models import User

class StaffType(models.Model):
    type = models.CharField(max_length=20, unique=True, null=False)
    def __str__(self):
        return self.type

class Staff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    name = models.CharField(max_length=50, null=False)
    type = models.ForeignKey(StaffType, on_delete=models.CASCADE)
    isAdmin = models.BooleanField(default=False)
    email = models.EmailField()
    phone = models.CharField(max_length=15)

    def __str__(self):
        return self.name

class Category(models.Model):
    category = models.CharField(max_length=20, unique=True, null=False)

    def __str__(self):
        return self.category

class SubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    subCategory = models.CharField(max_length=50, unique=True, null=False)

    def __str__(self):
        return self.subCategory

class Product(models.Model):
    subCategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE)
    sku = models.CharField(max_length=40, unique=True)  # for QR code 
    name = models.CharField(max_length=50, unique=True, null=False, db_index=True)
    description = models.TextField(max_length=500, null=True)
    stock = models.IntegerField(default=0)
    price = models.IntegerField(null=False)
    created_at = models.DateTimeField(auto_now_add=True)    
    
    def __str__(self):
        return self.name

class Product(models.Model):
    subCategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE)
    sku = models.CharField(max_length=40, unique=True)
    name = models.CharField(max_length=50, unique=True, null=False, db_index=True)
    description = models.TextField(max_length=500, null=True)
    stock = models.IntegerField(default=0)
    price = models.IntegerField(null=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)    
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Cart {self.id}"

class Transaction(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()

