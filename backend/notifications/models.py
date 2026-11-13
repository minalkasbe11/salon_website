from django.db import models
from core.models import BaseModel, User


class Notification(BaseModel):
    TYPE_CHOICES = [
        ('booking_confirmation', 'Booking Confirmation'),
        ('appointment_reminder', 'Appointment Reminder'),
        ('offer', 'Offer'),
        ('announcement', 'Salon Announcement'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=25, choices=TYPE_CHOICES)
    title = models.CharField(max_length=150)
    message = models.TextField()
    action_url = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user} - {self.title}"

    class Meta:
        db_table = 'notification'
        ordering = ['-created_at']
