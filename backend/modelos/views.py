from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Modelos
from .serializers import Modelos3DSerializer
from datetime import datetime, timedelta


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_modelos(request):
    status_param = request.GET.get('status')
    data_inicio = request.GET.get('data_inicio')
    data_fim = request.GET.get('data_fim')
    sort_by = request.GET.get('sort_by', 'prazo')
    try:
        modelos = list(Modelos.objects.all())
        # Filtro por status
        if status_param:
            if status_param.lower() == "notfinalizados":
                modelos = [m for m in modelos if m.status.lower() !=
                           "finalizado"]
            else:
                modelos = [m for m in modelos if m.status.lower() ==
                           status_param.lower()]
        # Conversão de strings para datas reais (formato dd/mm/yyyy)

        def parse_data(data_str):
            try:
                return datetime.strptime(data_str, "%d/%m/%Y").date()
            except:
                return None
        hoje = datetime.now().date()
        if data_inicio:
            data_i = datetime.strptime(data_inicio, "%Y-%m-%d").date()
        else:
            data_i = hoje - timedelta(days=30)
        modelos = [m for m in modelos if parse_data(
            m.data) and parse_data(m.data) >= data_i]
        if data_fim:
            data_f = datetime.strptime(data_fim, "%Y-%m-%d").date()
            modelos = [m for m in modelos if parse_data(
                m.data) and parse_data(m.data) <= data_f]
        # Ordenação
        if sort_by == 'prazo':
            modelos = sorted(modelos, key=lambda m: parse_data(
                m.prazo) or datetime.max.date())
        elif sort_by == 'data':
            modelos = sorted(modelos, key=lambda m: parse_data(
                m.data) or datetime.max.date())
        elif sort_by in ['paciente', 'status']:
            modelos = sorted(
                modelos, key=lambda m: getattr(m, sort_by).lower())
        serializer = Modelos3DSerializer(modelos, many=True)
        return Response(serializer.data)

    except Exception as e:
        return Response({"erro": str(e)}, status=500)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def atualizar_status(request, pedido):
    print(f">>> PATCH recebido para pedido={pedido}")

    try:
        modelo = Modelos.objects.get(pedido=pedido)
    except Modelos.DoesNotExist:
        print(">>> ERRO: Pedido não encontrado.")
        return Response({"error": "Modelo não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    novo_status = request.data.get("status")

    if not novo_status or not isinstance(novo_status, str) or novo_status.strip() == "":
        print(">>> ERRO: Status ausente ou inválido.")
        return Response({"error": "Campo 'status' é obrigatório e deve ser uma string não vazia."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        modelo.status = novo_status.strip()
        modelo.save()
        print(f">>> Status atualizado com sucesso para '{modelo.status}'")
        return Response({"success": True, "pedido": pedido, "status": modelo.status})
    except Exception as e:
        print(">>> ERRO ao salvar modelo:", str(e))
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_todos_modelos(request):
    print(">>> View de debug chamada:", request.method)
    try:
        modelos = Modelos.objects.all()
        print(f">>> Total de registros encontrados: {modelos.count()}")
        for m in modelos:
            print(
                f">>> Pedido: {m.pedido}, Paciente: {m.paciente}, Prazo: {m.prazo}")
        serializer = Modelos3DSerializer(modelos, many=True)
        return Response(serializer.data)
    except Exception as e:
        print(">>> ERRO AO SERIALIZAR:", str(e))
        return Response({"erro": str(e)}, status=500)
