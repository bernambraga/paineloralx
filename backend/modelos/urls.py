from django.urls import path
from .views import listar_modelos

urlpatterns = [
    path('listar/', listar_modelos, name='listar_modelos'),
]
