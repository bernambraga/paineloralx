from django.db.models import Max
from .models import Senha
from .utils import gerar_imagem_base64
from datetime import date
from django.utils.timezone import now, timedelta
from django.http import JsonResponse, HttpResponse,FileResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from django.conf import settings

@require_http_methods(["GET"])
def gerar_senha(request):
    tipo = request.GET.get('tipo')
    unidade = request.GET.get('unidade')
    if not tipo or not unidade:
        return JsonResponse({'error': 'Parâmetros inválidos'}, status=400)
    # Obtém o último número do dia para o tipo e unidade
    hoje = date.today()
    ultimo_numero = Senha.objects.filter(tipo=tipo, unidade=unidade, data_criacao=hoje).aggregate(Max('numero'))['numero__max']
    novo_numero = (ultimo_numero or 0) + 1
    try:
    # Cria a senha no banco de dados
        senha = Senha.objects.create(tipo=tipo, unidade=unidade, numero=novo_numero)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    # Gera a imagem Base64
    imagem_base64 = gerar_imagem_base64(tipo, novo_numero, unidade)

    return JsonResponse({'senha': f"{tipo.upper()}-{novo_numero}", 'imagem': imagem_base64})

@require_http_methods(["GET"])
def listar_senhas(request):
    unidade = request.GET.get('unidade')
    try:
        if unidade:
            # Busca apenas as senhas do dia atual para a unidade específica
            hoje = date.today()
            senhas = Senha.objects.filter(unidade=unidade, data_criacao=hoje).order_by('hora_criacao')
        else:
            # Busca senhas de todas as unidades nos últimos 2 dias
            dois_dias_atras = now().date() - timedelta(days=2)
            senhas = Senha.objects.filter(data_criacao__gte=dois_dias_atras).order_by('data_criacao', 'hora_criacao')
        # Formata as senhas para retorno JSON
        senhas_data = [
            {
                'tipo': senha.tipo,
                'numero': senha.numero,
                'unidade': senha.unidade,
                'data_criacao': senha.data_criacao.strftime('%Y-%m-%d'),
                'hora_criacao': senha.hora_criacao.strftime('%H:%M:%S'),
            }
            for senha in senhas
        ]
        return JsonResponse(senhas_data, safe=False)
    except Exception as e:
        print((e))
        return JsonResponse({'error': str(e)}, status=500)