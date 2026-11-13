from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Appointment, Service, Staff, StaffAvailability
from .appointment_serializers import AppointmentSerializer, AppointmentCreateSerializer

SLOT_INTERVAL_MINUTES = 30


def compute_available_slots(service, target_date, staff=None):
    """Returns [{'time': 'HH:MM', 'available': bool}, ...] in SLOT_INTERVAL_MINUTES steps.

    If `staff` is given, availability is checked against that stylist's own schedule
    (StaffAvailability) and their existing appointments only.

    If no `staff` is given ("Any Available"), we use the salon's general BusinessHours,
    and a slot counts as available as long as at least one stylist qualified for this
    service (Service.staff_members) is free at that time — not just one calendar.
    If the service has no staff assigned at all, capacity is treated as unconstrained
    (business-hours-only), since there's nothing to check conflicts against.
    """
    from website.models import BusinessHours  # deferred: core -> website is a one-way dependency, kept out of models.py

    day_of_week = target_date.strftime('%a').lower()
    qualifying_staff_ids = None  # None = unconstrained capacity

    if staff:
        try:
            avail = StaffAvailability.objects.get(staff=staff, day_of_week=day_of_week, is_active=True, is_delete=False)
        except StaffAvailability.DoesNotExist:
            return []
        if avail.is_off:
            return []
        open_time, close_time = avail.start_time, avail.end_time
        qualifying_staff_ids = [staff.id]
    else:
        try:
            hours = BusinessHours.objects.get(day_of_week=day_of_week, is_active=True, is_delete=False)
        except BusinessHours.DoesNotExist:
            return []
        if hours.is_closed or not hours.open_time or not hours.close_time:
            return []
        open_time, close_time = hours.open_time, hours.close_time
        staff_ids = list(service.staff_members.filter(is_active=True, is_delete=False).values_list('id', flat=True))
        if staff_ids:
            qualifying_staff_ids = staff_ids

    duration = timedelta(minutes=service.duration_minutes)
    interval = timedelta(minutes=SLOT_INTERVAL_MINUTES)

    busy_qs = Appointment.objects.filter(
        appointment_date=target_date, status__in=['pending', 'confirmed'], is_delete=False,
    )
    if staff:
        busy_qs = busy_qs.filter(staff=staff)
    elif qualifying_staff_ids is not None:
        busy_qs = busy_qs.filter(staff_id__in=qualifying_staff_ids)
    else:
        busy_qs = busy_qs.none()

    busy_intervals = [(a.start_time, a.end_time, a.staff_id) for a in busy_qs]

    now = timezone.localtime()
    is_today = target_date == now.date()

    slots = []
    current = datetime.combine(target_date, open_time)
    close_dt = datetime.combine(target_date, close_time)

    while current + duration <= close_dt:
        slot_start = current.time()
        slot_end = (current + duration).time()

        if is_today and slot_start <= now.time():
            available = False
        elif staff:
            available = not any(
                not (slot_end <= b_start or slot_start >= b_end) for b_start, b_end, _ in busy_intervals
            )
        elif qualifying_staff_ids is not None:
            busy_at_slot = {
                sid for b_start, b_end, sid in busy_intervals if not (slot_end <= b_start or slot_start >= b_end)
            }
            available = len(busy_at_slot) < len(qualifying_staff_ids)
        else:
            available = True

        slots.append({'time': slot_start.strftime('%H:%M'), 'available': available})
        current += interval

    return slots


def pick_available_staff(service, appointment_date, start_time, end_time):
    """For an 'Any Available' booking: actually assign one free, qualified stylist now,
    rather than leaving staff unset — an unassigned appointment can't block anyone's
    calendar, which would silently let the same slot be double- and triple-booked."""
    staff_ids = list(service.staff_members.filter(is_active=True, is_delete=False).values_list('id', flat=True))
    if not staff_ids:
        return None  # service has no assigned stylists — capacity stays unconstrained

    busy_staff_ids = set(
        Appointment.objects.filter(
            appointment_date=appointment_date, status__in=['pending', 'confirmed'], is_delete=False,
            staff_id__in=staff_ids, start_time__lt=end_time, end_time__gt=start_time,
        ).values_list('staff_id', flat=True)
    )
    available_ids = [sid for sid in staff_ids if sid not in busy_staff_ids]
    return Staff.objects.get(id=available_ids[0]) if available_ids else None


class AppointmentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']  # updates go through the cancel action, not raw PATCH/DELETE

    def get_queryset(self):
        return Appointment.objects.filter(customer=self.request.user, is_delete=False)

    def get_serializer_class(self):
        return AppointmentCreateSerializer if self.action == 'create' else AppointmentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = serializer.validated_data['service']
        staff = serializer.validated_data.get('staff')
        appointment_date = serializer.validated_data['appointment_date']
        start_time = serializer.validated_data['start_time']

        # Re-check availability server-side — never trust a slot the client claims is free.
        requested = start_time.strftime('%H:%M')
        slot_match = next((s for s in compute_available_slots(service, appointment_date, staff) if s['time'] == requested), None)
        if not slot_match or not slot_match['available']:
            return Response(
                {'detail': "That time slot is no longer available. Please pick another."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        end_dt = datetime.combine(appointment_date, start_time) + timedelta(minutes=service.duration_minutes)

        assigned_staff = staff or pick_available_staff(service, appointment_date, start_time, end_dt.time())

        appointment = Appointment.objects.create(
            customer=request.user,
            service=service,
            staff=assigned_staff,
            assignment_type='chosen' if staff else 'auto',
            appointment_date=appointment_date,
            start_time=start_time,
            end_time=end_dt.time(),
            notes=serializer.validated_data.get('notes', ''),
        )
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='available-slots')
    def available_slots(self, request):
        service_id = request.query_params.get('service')
        date_str = request.query_params.get('date')
        staff_id = request.query_params.get('staff')

        if not service_id or not date_str:
            return Response({'detail': 'service and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service = Service.objects.get(id=service_id, is_active=True, is_delete=False)
        except Service.DoesNotExist:
            return Response({'detail': 'Service not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'detail': 'date must be in YYYY-MM-DD format.'}, status=status.HTTP_400_BAD_REQUEST)

        staff = None
        if staff_id:
            try:
                staff = Staff.objects.get(id=staff_id, is_active=True, is_delete=False)
            except Staff.DoesNotExist:
                return Response({'detail': 'Staff not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(compute_available_slots(service, target_date, staff))

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        if appointment.status not in ('pending', 'confirmed'):
            return Response(
                {'detail': f'Cannot cancel an appointment that is {appointment.status}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        appointment.status = 'cancelled'
        appointment.save(update_fields=['status', 'updated_at'])
        return Response(AppointmentSerializer(appointment).data)
