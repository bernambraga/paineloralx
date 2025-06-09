from django.urls import path
from .views import *

urlpatterns = [
    path('grafico-geral/', get_grafico_geral, name='grafico_geral'),
    path('top-15-solicitantes/', get_top_15_solicitantes, name='top_15_solicitantes'),
    path('solicitantes/', get_solicitantes, name='solicitantes'),
    path('solicitante-details/', get_solicitante_details, name='details_solicitante'),
]
