from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
