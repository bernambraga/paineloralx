from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from users.views import CustomAuthToken, Logout, GetCSRFToken, UserDetail

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', CustomAuthToken.as_view(), name='api-login'),
    path('api/logout/', Logout.as_view(), name='api-logout'),
    path('api/csrf/', GetCSRFToken.as_view(), name='api-csrf-token'),
    path('api/user/', UserDetail.as_view(), name='api-user-detail'),
    path('', TemplateView.as_view(template_name='index.html')),
    path('users/', include('users.urls')),
]
