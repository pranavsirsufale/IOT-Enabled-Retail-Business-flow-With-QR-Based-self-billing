from rest_framework.routers import DefaultRouter
from .views import StaffViewSet, StaffTypeViewSet

router = DefaultRouter()
router.register("staff-types", StaffTypeViewSet)
router.register("staff", StaffViewSet)

urlpatterns = router.urls
