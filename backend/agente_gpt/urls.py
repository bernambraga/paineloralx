# agente_gpt/urls.py
from django.urls import path
from .views import *

urlpatterns = [
    path('gpt/', prompt_agente, name='prompt-agente'),
    path('gpt/tarefas/<int:project_id>/', listar_tarefas, name='listar_tarefas'),
]
