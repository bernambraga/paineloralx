from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', TemplateView.as_view(template_name='index.html')),
    path('users/', include('users.urls')),
    path('bots/', include('bots.urls')),
]
