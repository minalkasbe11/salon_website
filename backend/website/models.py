from django.db import models
from core.models import BaseModel, ServiceCategory, Service


class SalonInformation(BaseModel):
    """Site-wide salon details. Convention: only one row is expected to be active at a time."""
    name = models.CharField(max_length=150)
    tagline = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='website/logo/', blank=True, null=True)

    address = models.TextField(blank=True)
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    founded_year = models.PositiveIntegerField(null=True, blank=True)

    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    whatsapp_number = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'salon_information'
        verbose_name_plural = 'Salon Information'


class BusinessHours(BaseModel):
    DAY_CHOICES = [
        ('mon', 'Monday'), ('tue', 'Tuesday'), ('wed', 'Wednesday'),
        ('thu', 'Thursday'), ('fri', 'Friday'), ('sat', 'Saturday'), ('sun', 'Sunday'),
    ]
    day_of_week = models.CharField(max_length=3, choices=DAY_CHOICES, unique=True)
    open_time = models.TimeField(null=True, blank=True)
    close_time = models.TimeField(null=True, blank=True)
    is_closed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.get_day_of_week_display()}: {'Closed' if self.is_closed else f'{self.open_time} - {self.close_time}'}"

    class Meta:
        db_table = 'business_hours'
        verbose_name_plural = 'Business Hours'
        ordering = ['id']


class Offer(BaseModel):
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='website/offers/', blank=True, null=True)
    category = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='offers')
    discount_percentage = models.PositiveIntegerField(null=True, blank=True)
    valid_from = models.DateField()
    valid_until = models.DateField()
    is_featured = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'offer'
        ordering = ['-is_featured', 'valid_until']


class Gallery(BaseModel):
    image = models.ImageField(upload_to='website/gallery/')
    caption = models.CharField(max_length=200, blank=True)
    category = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='gallery_items')
    display_order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.caption or f"Gallery image {self.pk}"

    class Meta:
        db_table = 'gallery'
        verbose_name_plural = 'Gallery'
        ordering = ['display_order']


class Testimonial(BaseModel):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]

    customer_name = models.CharField(max_length=100)
    customer_photo = models.ImageField(upload_to='website/testimonials/', blank=True, null=True)
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES, default=5)
    message = models.TextField()
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True, related_name='testimonials')
    is_featured = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.customer_name} ({self.rating}★)"

    class Meta:
        db_table = 'testimonial'
        ordering = ['-is_featured', '-created_at']
