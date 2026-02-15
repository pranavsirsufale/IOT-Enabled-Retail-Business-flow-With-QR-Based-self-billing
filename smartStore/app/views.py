from rest_framework.viewsets import ModelViewSet
from .models import Staff, StaffType
from .serializers import StaffSerializer, StaffTypeSerializer

class StaffTypeViewSet(ModelViewSet):
    queryset = StaffType.objects.all()
    serializer_class = StaffTypeSerializer

class StaffViewSet(ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer

