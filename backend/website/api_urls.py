from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import SalonInformationView, BusinessHoursViewSet, OfferViewSet, GalleryViewSet, TestimonialViewSet

router = DefaultRouter()
router.register('business-hours', BusinessHoursViewSet, basename='business-hours')
router.register('offers', OfferViewSet, basename='offer')
router.register('gallery', GalleryViewSet, basename='gallery')
router.register('testimonials', TestimonialViewSet, basename='testimonial')

urlpatterns = [
    path('salon-info/', SalonInformationView.as_view(), name='salon-info'),
] + router.urls
