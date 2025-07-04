from django.urls import path, include
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('current-user/', user_info, name='current_user'),
    path('csrf/', get_csrf_token, name='csrf'),
    path('newuser/', new_user, name='new_user'),
    path('resetpass/', reset_pass, name='reset_pass'),
    path('users/', list_users, name='list_users'),
    path('delete-user/', delete_user, name='delete_user'),
    path('update-user/', update_user, name='update_user'),
    path('getgroups/', getgroups, name='getgroups'),
    path('bots/', include('bots.urls')),
    path('sac/', include('sac.urls')),
    path('comercial/', include('comercial.urls')),
    path('senhas/', include('senhas.urls')),
    path('modelos/', include('modelos.urls')),
    path('gpt/', include('agente_gpt.urls')),
    path('recepcao/', include('recepcao.urls')),
]
