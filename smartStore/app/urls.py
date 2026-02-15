from rest_framework.routers import DefaultRouter
from .views import StaffViewSet, StaffTypeViewSet, CategoryViewSet, SubCategoryViewSet, ProductViewSet

router = DefaultRouter()
router.register("staff-types", StaffTypeViewSet)
router.register("staff", StaffViewSet)
router.register("category", CategoryViewSet)
router.register("sub-category", SubCategoryViewSet)
router.register("product", ProductViewSet)

urlpatterns = router.urls
