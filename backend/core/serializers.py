from rest_framework import serializers
from .models import ServiceCategory, Service, Staff


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            'id', 'category', 'image', 'name', 'description',
            'price', 'duration_minutes', 'is_featured', 'gender',
        ]


class ServiceCategorySerializer(serializers.ModelSerializer):
    services = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'display_order', 'services']

    def get_services(self, obj):
        active_services = obj.services.filter(is_active=True, is_delete=False)
        return ServiceSerializer(active_services, many=True).data


class StaffSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Staff
        fields = ['id', 'name', 'specialty', 'bio', 'experience_years', 'profile_image', 'rating', 'services']

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
