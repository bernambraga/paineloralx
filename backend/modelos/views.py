from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Modelos  # ou o nome que você deu à model
from .serializers import Modelos3DSerializer
from datetime import datetime

@api_view(['GET'])
def listar_modelos(request):
    data_inicio = request.query_params.get('inicio')
    data_fim = request.query_params.get('fim')

    try:
        if not data_inicio or not data_fim:
            return Response({"erro": "Parâmetros 'inicio' e 'fim' são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        # Converte para datetime
        dt_inicio = datetime.strptime(data_inicio, '%Y-%m-%d')
        dt_fim = datetime.strptime(data_fim, '%Y-%m-%d')

        modelos = Modelos3D.objects.filter(data__range=(dt_inicio, dt_fim)).order_by('-data')
        serializer = Modelos3DSerializer(modelos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)
