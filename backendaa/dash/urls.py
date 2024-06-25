from django.urls import path
from . import views


urlpatterns = [
    path('about/', views.about_view, name='about'),
    path('', views.home_view, name='home'),
    path('api/csrf/', views.csrf, name='csrf'),
]
