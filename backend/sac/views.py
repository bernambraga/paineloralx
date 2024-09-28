#sac/views.py

### Alterações ###
# Quando abrir modal tornar o resto da pagina inacessivel
# organizar CSS dos modais
# Download do Excel da pesquisa
# Graficos??
### Fim Alterações ###

import pandas as pd
from django.http import JsonResponse, HttpResponse,FileResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from django.conf import settings
from .models import SAC, SACMotivosNegativos
import logging
import json
import os
from datetime import datetime
from io import BytesIO
from dateutil.relativedelta import relativedelta
import fitz
from PIL import Image

logger = logging.getLogger('django')

# Função para criar a tabela se não existir

@require_http_methods(["GET"])
def listar_motivos_negativos(request):
    motivos = SACMotivosNegativos.objects.all()
    data = [{'id': motivo.id, 'motivo': motivo.motivo} for motivo in motivos]
    return JsonResponse(data, safe=False)

@require_http_methods(["GET"])
def criar_motivo(request):
    motivo = request.GET.get('newMotivo')
    try:
        if motivo:
            SACMotivosNegativos.objects.create(motivo=motivo)
            return JsonResponse({'status': 'success'})
        return JsonResponse({'status': 'error', 'message': 'Motivo não fornecido'})
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Erro ao decodificar JSON'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})
    
@require_http_methods(["GET"])
def excluir_motivo(request):
    motivo_id = request.GET.get('motivoId')  # Renomeando para padrão snake_case
    try:
        motivo = SACMotivosNegativos.objects.get(id=motivo_id)  # Use get para obter um único objeto
    except SACMotivosNegativos.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Motivo não encontrado'}, status=404)
    # Verifica se o motivo está em uso na tabela SAC
    if not SAC.objects.filter(motivo=motivo.motivo).exists():
        motivo.delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'Existem atendimentos relacionados a esse motivo'}, status=400)

@require_http_methods(["GET"])
def transferir_motivos(request):
    motivo_a = request.GET.get('motivoa')
    motivo_b = request.GET.get('motivob')
    if motivo_a == motivo_b:
        return JsonResponse({'status': 'error', 'message': 'Motivos são iguais'})
    if motivo_a and motivo_b:
        SAC.objects.filter(motivo=motivo_a).update(motivo=motivo_b)
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'Motivos não fornecidos'}, status=400)


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
        atendimentos = SAC.objects.filter(data=data).order_by('paciente')
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

@require_http_methods(["GET"])
def editar_atendimento_pos(request):
    try:
        pedidoid = request.GET.get('pedido')
        atendimento = get_object_or_404(SAC, pedido=pedidoid)
        atendimento.resposta = "Positiva"
        atendimento.motivo = ""
        atendimento.obs = ""
        atendimento.save()
        return JsonResponse({'status': 'success'})
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Erro ao decodificar JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@require_http_methods(["GET"])
def editar_atendimento_neg(request):
    try:
        pedidoid = request.GET.get('pedido')
        motivo = request.GET.get('motivo')
        comentario = request.GET.get('comentario')
        atendimento = get_object_or_404(SAC, pedido=pedidoid)
        atendimento.resposta = "Negativa"
        atendimento.motivo = motivo
        atendimento.obs = comentario
        atendimento.save()
        return JsonResponse({'status': 'success'})
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Erro ao decodificar JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
@require_http_methods(["GET"])
def voucher(request):
    try:
        pedidoid = request.GET.get('pedidoId')
        atendimento = get_object_or_404(SAC, pedido=pedidoid)
        # Caminho do arquivo dentro de static
        root = settings.STATIC_ROOT
        file_path = root + '/img/voucher.pdf'
        if os.path.exists(file_path):
            with open(file_path, 'rb') as img_file:
                buffer = gerar_voucher(atendimento, img_file)
            atendimento.voucher = "Teste" + " - " + str(datetime.now().strftime("%d/%m/%Y"))
            atendimento.save()
            return FileResponse(buffer, as_attachment=True, content_type='image/jpeg', filename=f'voucher_{atendimento.paciente}.jpg')
        else:
            return JsonResponse({'status': 'error', 'message': 'Arquivo não encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
def gerar_voucher(atendimento, voucher):
    # Abrir o PDF
    doc = fitz.open(voucher)
    page = doc.load_page(0)  # Carregar a primeira página do PDF

    # Definir o nome do paciente e a data atual
    paciente_nome = atendimento.paciente.title()
    data_validade = (datetime.now() + relativedelta(months=6)).strftime("%d/%m/%Y")

    # Definir a posição do texto no PDF (ajuste conforme necessário)
    text_position = (29, 235)  # Posição X, Y

    # Adicionar o texto na página
    page.insert_text(text_position, f"{paciente_nome}     -     Valido até {data_validade}",
                     fontname="helv", fontsize=13, color=(0, 0, 0))

    # Renderizar a página como imagem
    zoom = 5  # 2x significa 144 DPI (o padrão é 72 DPI)
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    img = Image.open(BytesIO(pix.tobytes("png")))

    # Converter a imagem para o formato JPEG
    buffer = BytesIO()
    img = img.convert("RGB")  # Converte para RGB se for necessário
    img.save(buffer, format="JPEG", quality=95)
    buffer.seek(0)  # Retorna o ponteiro do buffer para o início

    # Retornar o buffer contendo a imagem
    return buffer