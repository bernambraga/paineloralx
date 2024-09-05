from django.urls import path
from .views import *

urlpatterns = [
    path('grafico-geral/', get_grafico_geral, name='grafico_geral'),
    path('top-15-solicitantes/', get_top_15_solicitantes, name='top_15_solicitantes'),
]
