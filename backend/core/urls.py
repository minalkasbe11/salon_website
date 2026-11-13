from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_page, name='home'),
    path('services/',views.services_page, name='services_page'),
    path('about/',views.about_page, name='about_page'),
    path('contact/',views.contact_page, name='contact_page'),
    path('booking/',views.booking_page, name='booking_page'),
    path('stylists',views.stylists_page, name='stylists_page'),
]