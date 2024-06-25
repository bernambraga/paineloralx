from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', auth_views.LoginView.as_view(), name='login'),
    path('api/logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('', TemplateView.as_view(template_name='index.html')),
]
