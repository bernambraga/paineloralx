from django.urls import path, include
from .views import LoginView, LogoutView, get_csrf_token, CustomLoginView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('csrf/', get_csrf_token, name='csrf'),
    path('bots/', include('bots.urls')),
    path('sac/', include('sac.urls')),
]
