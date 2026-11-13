from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User,Service,ServiceCategory,Staff,Appointment
# Register your models here.
admin.site.register(User,UserAdmin)
admin.site.register(ServiceCategory)
admin.site.register(Service)
admin.site.register(Staff)
admin.site.register(Appointment)