from django.urls import path
from .views import *

urlpatterns = [
    path('motivos/', listar_motivos_negativos, name='listar_motivos_negativos'),
    path('criar_motivo/', criar_motivo, name='criar_motivo'),
    path('transferir_motivos/', transferir_motivos, name='transferir_motivos'),
    path('excluir_motivo/', excluir_motivo, name='excluir_motivo'),
    path('relatorio/', listar_atendimentos, name='listar_atendimentos_por_data'),
    path('relatorioDownload/', excel_atendimentos, name='fornecer_excel_atendimentos'),
    path('editar_atendimento_pos/', editar_atendimento_pos, name='editar_atendimento_pos'),
    path('editar_atendimento_neg/', editar_atendimento_neg, name='editar_atendimento_neg'),
    path('voucher/', voucher, name='voucher'),
]