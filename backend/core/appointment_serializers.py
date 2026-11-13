from rest_framework import serializers
from .models import Appointment, Service, Staff
from .serializers import ServiceSerializer, StaffSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    """Read serializer — used for listing a customer's own appointments."""
    service = ServiceSerializer(read_only=True)
    staff = StaffSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'service', 'staff', 'assignment_type', 'appointment_date',
            'start_time', 'end_time', 'status', 'payment_status', 'notes', 'created_at',
        ]


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['service', 'staff', 'appointment_date', 'start_time', 'notes']

    def validate_service(self, value):
        if not value.is_active or value.is_delete:
            raise serializers.ValidationError("This service is not currently available.")
        return value

    def validate_appointment_date(self, value):
        from django.utils import timezone
        if value < timezone.localdate():
            raise serializers.ValidationError("Appointment date can't be in the past.")
        return value
