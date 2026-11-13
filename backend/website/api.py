from django.utils import timezone
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SalonInformation, BusinessHours, Offer, Gallery, Testimonial
from .serializers import (
    SalonInformationSerializer, BusinessHoursSerializer,
    OfferSerializer, GallerySerializer, TestimonialSerializer,
)


class SalonInformationView(APIView):
    """Singleton resource — returns the one active salon-info row directly, not a list."""

    def get(self, request):
        info = SalonInformation.objects.filter(is_active=True, is_delete=False).first()
        if not info:
            return Response({}, status=404)
        return Response(SalonInformationSerializer(info).data)


class BusinessHoursViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BusinessHours.objects.filter(is_active=True, is_delete=False)
    serializer_class = BusinessHoursSerializer


class OfferViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OfferSerializer

    def get_queryset(self):
        today = timezone.now().date()
        return Offer.objects.filter(
            is_active=True, is_delete=False,
            valid_from__lte=today, valid_until__gte=today,
        )


class GalleryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GallerySerializer

    def get_queryset(self):
        qs = Gallery.objects.filter(is_active=True, is_delete=False)
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs


class TestimonialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Testimonial.objects.filter(is_active=True, is_delete=False)
    serializer_class = TestimonialSerializer
