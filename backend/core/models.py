from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
# Create your models here.


class BaseModel(models.Model):
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    created_by = models.BigIntegerField(null=True, blank=True, db_index=True)

    updated_at = models.DateTimeField(auto_now=True)
    updated_by =models.BigIntegerField(null=True, blank=True, db_index=True)

    is_delete = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        abstract = True

class User(AbstractUser):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=15, blank=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    loyalty_points = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'user'

class ServiceCategory(BaseModel):
    name = models.CharField(max_length=100)              # e.g. "Hair", "Skin", "Spa"
    display_order = models.PositiveIntegerField(default=0) # control order shown on site

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'service_category'
        ordering = ['display_order', 'name']

class Service(BaseModel):
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='services')
    image = models.ImageField(upload_to='services/', blank=True, null=True)
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    duration_minutes = models.PositiveIntegerField()       # needed for slot calculation
    is_featured = models.BooleanField(default=False)        # highlight on homepage
    gender = models.CharField(
        max_length=10,
        choices=[('male', 'Male'), ('female', 'Female'), ('unisex', 'Unisex')],
        default='unisex'
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['category', 'name']
        db_table = 'service'

class Staff(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    specialty = models.CharField(max_length=150, blank=True)   # e.g. "Hair color specialist"
    bio = models.TextField(blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    profile_image = models.ImageField(upload_to='staff/', blank=True, null=True)
    services = models.ManyToManyField(Service, related_name='staff_members', blank=True)
    joined_date = models.DateField(null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)  # avg from reviews, updated periodically

    def __str__(self):
        return self.user.get_full_name() or self.user.username

    class Meta:
        db_table = 'staff'

class StaffAvailability(BaseModel):
    DAY_CHOICES = [
        ('mon', 'Monday'), ('tue', 'Tuesday'), ('wed', 'Wednesday'),
        ('thu', 'Thursday'), ('fri', 'Friday'), ('sat', 'Saturday'), ('sun', 'Sunday'),
    ]
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='availability')
    day_of_week = models.CharField(max_length=3, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_off = models.BooleanField(default=False)  # mark a day as off instead of deleting the row

    def __str__(self):
        return f"{self.staff} - {self.get_day_of_week_display()}"

    class Meta:
        verbose_name_plural = "Staff Availability"
        unique_together = ('staff', 'day_of_week')
        db_table = 'staff_availability'


class Appointment(BaseModel):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        # ('no_show', 'No Show'),
    ]
    ASSIGNMENT_CHOICES = [
        ('chosen', 'Customer Chose Stylist'),
        ('auto', 'Auto-Assigned'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid_at_salon', 'Paid at Salon'),
    ]

    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    staff = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='appointments')

    assignment_type = models.CharField(max_length=10, choices=ASSIGNMENT_CHOICES, default='chosen')

    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()   # calculated from service.duration_minutes

    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=15, choices=PAYMENT_STATUS_CHOICES, default='unpaid')

    notes = models.TextField(blank=True)   # customer's special request, if any

    def __str__(self):
        return f"{self.customer} - {self.service} on {self.appointment_date} {self.start_time}"

    class Meta:
        db_table = 'appointment'
        ordering = ['-appointment_date', '-start_time']