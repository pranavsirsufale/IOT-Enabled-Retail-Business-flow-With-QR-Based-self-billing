from rest_framework import serializers
from .models import Staff, StaffType

class StaffTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffType
        fields = "__all__"

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = "__all__"

