from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import logout_view, current_user, LoginView, StaffViewSet, StaffTypeViewSet, CategoryViewSet, SubCategoryViewSet, ProductViewSet

router = DefaultRouter()
router.register("staff-types", StaffTypeViewSet)
router.register("staff", StaffViewSet)
router.register("category", CategoryViewSet)
router.register("sub-category", SubCategoryViewSet)
router.register("product", ProductViewSet)

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("logout/", logout_view),
    path("me/", current_user),
]

urlpatterns += router.urls   # include DRF routes
