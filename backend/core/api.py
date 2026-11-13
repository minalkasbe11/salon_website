from rest_framework import viewsets
from .models import ServiceCategory, Service, Staff
from .serializers import ServiceCategorySerializer, ServiceSerializer, StaffSerializer


class ServiceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServiceCategory.objects.filter(is_active=True, is_delete=False).prefetch_related('services')
    serializer_class = ServiceCategorySerializer


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Service.objects.filter(is_active=True, is_delete=False)
    serializer_class = ServiceSerializer


class StaffViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StaffSerializer

    def get_queryset(self):
        qs = Staff.objects.filter(is_active=True, is_delete=False)
        service_id = self.request.query_params.get('service')
        if service_id:
            qs = qs.filter(services__id=service_id)
        return qs
