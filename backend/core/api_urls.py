from rest_framework.routers import DefaultRouter
from .api import ServiceCategoryViewSet, ServiceViewSet, StaffViewSet
from .appointment_api import AppointmentViewSet

router = DefaultRouter()
router.register('service-categories', ServiceCategoryViewSet, basename='service-category')
router.register('services', ServiceViewSet, basename='service')
router.register('staff', StaffViewSet, basename='staff')
router.register('appointments', AppointmentViewSet, basename='appointment')

urlpatterns = router.urls
