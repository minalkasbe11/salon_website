from django.shortcuts import render
from .models import ServiceCategory
# Create your views here.

def home_page(request):
    return render(request, "core/index.html")

def services_page(request):
    return render(request, "core/services.html")

def about_page(request):
    return render(request, "core/about.html")

def contact_page(request):
    return render(request, "core/contact.html")

def booking_page(request):
    return render(request, "core/booking.html")

def stylists_page(request):
    return render(request, "core/stylists.html")