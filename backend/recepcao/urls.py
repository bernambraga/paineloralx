from django.urls import path
from . import views

urlpatterns = [
    path('arquivos/', views.listar_arquivos, name='listar_arquivos'),
    path('tutoriais/', views.listar_tutoriais, name='listar_tutoriais'),
    path('tutoriais/criar/', views.criar_tutorial, name='criar_tutorial'),
]
