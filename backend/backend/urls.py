from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from users.views import CustomAuthToken, Logout, GetCSRFToken, UserDetail
from users.consumers import LogConsumer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', CustomAuthToken.as_view(), name='login'),
    path('api/logout/', Logout.as_view(), name='logout'),
    path('api/csrf/', GetCSRFToken.as_view(), name='csrf'),
    path('api/user/', UserDetail.as_view(), name='user-detail'),
    path('', TemplateView.as_view(template_name='index.html')),
    path('ws/logs/', LogConsumer.as_asgi()),
    path('users/', include('users.urls')),
]
