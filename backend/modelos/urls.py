from django.urls import path
from .views import listar_todos_modelos, listar_modelos, atualizar_status

urlpatterns = [
    path('listmodels/', listar_modelos, name='listar_modelos'),
    path('<str:pedido>/', atualizar_status, name='atualizar_status'),
]
