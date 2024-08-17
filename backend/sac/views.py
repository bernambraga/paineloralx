#sac/views.py

import pandas as pd
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from .models import SAC, SACMotivosNegativos
import logging
import json
from datetime import datetime

logger = logging.getLogger('django')

# Função para criar a tabela se não existir

@require_http_methods(["GET"])
def listar_motivos_negativos(request):
    motivos = SACMotivosNegativos.objects.all()
    data = [{'id': motivo.id, 'motivo': motivo.motivo} for motivo in motivos]
    return JsonResponse(data, safe=False)

@require_http_methods(["POST"])
def criar_motivo(request):
    print("aqui")
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            motivo = data.get('motivo')
            if motivo:
                SACMotivosNegativos.objects.create(motivo=motivo)
                return JsonResponse({'status': 'success'})
            return JsonResponse({'status': 'error', 'message': 'Motivo não fornecido'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Erro ao decodificar JSON'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

@require_http_methods(["POST"])
def transferir_atendimentos(request):
    motivo_a = request.POST.get('motivo_a')
    motivo_b = request.POST.get('motivo_b')
    if motivo_a and motivo_b:
        SAC.objects.filter(Motivo=motivo_a).update(Motivo=motivo_b)
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'Motivos não fornecidos'}, status=400)

@require_http_methods(["DELETE"])
def excluir_motivo(request, motivo_id):
    motivo = get_object_or_404(SACMotivosNegativos, id=motivo_id)
    if not SAC.objects.filter(Motivo=motivo.motivo).exists():
        motivo.delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'Existem atendimentos relacionados a esse motivo'}, status=400)

@require_http_methods(["GET"])
def listar_atendimentos(request):
    try:
        data = request.GET.get('data')
        if not data:
            return JsonResponse({"error": "Data não fornecida"})
        try:
            data = datetime.strptime(data, '%d/%m/%Y').strftime('%Y-%m-%d')
        except ValueError:
            return JsonResponse({"error": "Formato de data inválido"})
        atendimentos = SAC.objects.filter(data=data)
        data = list(atendimentos.values())
        return JsonResponse(data, safe=False)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Erro ao decodificar JSON'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})

@require_http_methods(["GET"])
def excel_atendimentos(request, data):
    atendimentos = SAC.objects.filter(Data=data)
    df = pd.DataFrame(list(atendimentos.values()))
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = f'attachment; filename=atendimentos_{data}.xlsx'
    df.to_excel(response, index=False)
    return response

@require_http_methods(["POST"])
def editar_atendimento(request, pedido):
    atendimento = get_object_or_404(SAC, Pedido=pedido)
    atendimento.Status = request.POST.get('Status', atendimento.Status)
    atendimento.Bot_Status = request.POST.get('Bot_Status', atendimento.Bot_Status)
    atendimento.Bot_DateTime = request.POST.get('Bot_DateTime', atendimento.Bot_DateTime)
    atendimento.Resposta = request.POST.get('Resposta', atendimento.Resposta)
    atendimento.Motivo = request.POST.get('Motivo', atendimento.Motivo)
    atendimento.Obs = request.POST.get('Obs', atendimento.Obs)
    atendimento.Voucher = request.POST.get('Voucher', atendimento.Voucher)
    atendimento.Agenda = request.POST.get('Agenda', atendimento.Agenda)
    atendimento.Paciente = request.POST.get('Paciente', atendimento.Paciente)
    atendimento.Telefone = request.POST.get('Telefone', atendimento.Telefone)
    atendimento.save()
    return JsonResponse({'status': 'success'})
