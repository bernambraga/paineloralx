from django.urls import path
from users.views import CustomAuthToken, GetCSRFToken, UserDetail
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('login/', CustomAuthToken.as_view(), name='api-login'),
    path('logout/', auth_views.LogoutView.as_view(), name='api-logout'),
    path('csrf/', GetCSRFToken.as_view(), name='api-csrf-token'),
    path('user/', UserDetail.as_view(), name='api-user-detail'),
]