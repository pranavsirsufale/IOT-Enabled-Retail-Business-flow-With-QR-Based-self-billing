from models import models

class StaffType(models.Model):
    type = models.CharField(max_length=20, unique=True, null=False)

    def __str__(self):
        return self.type

class Staff(models.Model):
    name = models.CharField(max_length=50, null=False)
    type = models.ForeignKey(StaffType, on_delete=models.CASCADE)
    isAdmin = models.BinaryField()
    email = models.EmailField()
    pnone = models.CharField(max_length=15)

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
    name = models.CharField(max_length=50, unique=True, null=False, db_index=True)
    description = models.TextField(max_length=500, null=True)
    count = models.IntegerField(null=False)
    price = models.IntegerField(null=False)

    def __str__(self):
        return self.name

class Cart(models.Model):
    def __str__(self):
        return self

class Transaction(models.Model):
    cart = models.ManyToOneRel(Cart, on_delete=models.CASCADE)
    product = models.ManyToOneRel(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()

