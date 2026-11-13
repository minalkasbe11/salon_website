from rest_framework import serializers
from .models import SalonInformation, BusinessHours, Offer, Gallery, Testimonial


class SalonInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalonInformation
        fields = [
            'id', 'name', 'tagline', 'description', 'logo',
            'address', 'phone', 'email', 'founded_year',
            'instagram_url', 'facebook_url', 'whatsapp_number',
        ]


class BusinessHoursSerializer(serializers.ModelSerializer):
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = BusinessHours
        fields = ['id', 'day_of_week', 'day_of_week_display', 'open_time', 'close_time', 'is_closed']


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = [
            'id', 'title', 'description', 'image', 'category',
            'discount_percentage', 'valid_from', 'valid_until', 'is_featured',
        ]


class GallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gallery
        fields = ['id', 'image', 'caption', 'category', 'display_order']


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['id', 'customer_name', 'customer_photo', 'rating', 'message', 'service', 'is_featured']
