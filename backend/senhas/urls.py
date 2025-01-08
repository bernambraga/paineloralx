from django.urls import path
from .views import *

urlpatterns = [
    path('gerar_senha/', gerar_senha, name='gerar_senha'),
    path('listar_senhas/', listar_senhas, name='listar_senhas'),
]
