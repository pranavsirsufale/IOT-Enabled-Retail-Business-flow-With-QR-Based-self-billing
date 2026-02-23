from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Alphabetized and grouped imports for better readability
from .views import (
    CartDraftView,
    CategoryViewSet,
    LoginView,
    ProductViewSet,
    StaffTypeViewSet,
    StaffViewSet,
    SubCategoryViewSet,
    TransactionCreateView,
    current_user,
    logout_view,
)

router = DefaultRouter()

# RESTful convention prefers plural nouns for resource endpoints
router.register(r"staff-types", StaffTypeViewSet, basename="staff-type")
router.register(r"staff", StaffViewSet, basename="staff")
router.register(r"category", CategoryViewSet, basename="category")
router.register(r"sub-category", SubCategoryViewSet, basename="sub-category")
router.register(r"product", ProductViewSet, basename="product")

urlpatterns = [
    # Auth & User Endpoints
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", logout_view, name="logout"),
    path("me/", current_user, name="current-user"),
    
    # Cart & Transaction Endpoints
    # A GET request here fetches the cart, a POST request saves it
    path("cart/", CartDraftView.as_view(), name="cart-draft"), 
    path("transactions/", TransactionCreateView.as_view(), name="transaction-create"),

    # Include DRF Router URLs
    path("", include(router.urls)),
]