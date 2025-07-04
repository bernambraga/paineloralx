import os
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Tutorial
from .serializers import TutorialSerializer
from django.contrib.auth.decorators import permission_required

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_arquivos(request):
    path = os.path.join(settings.MEDIA_ROOT, 'recepcao','arquivos')
    arquivos = []

    if os.path.exists(path):
        for nome in os.listdir(path):
            if nome.endswith('.pdf'):
                arquivos.append({
                    'nome': nome,
                    'url': request.build_absolute_uri(
                        f"{settings.MEDIA_URL}recepcao/arquivos/{nome}"
                    )
                })
    else:
        print('Pasta media não encontrada')
    return Response(arquivos)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_tutoriais(request):
    tutoriais = Tutorial.objects.all().order_by('-criado_em')
    serializer = TutorialSerializer(tutoriais, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def criar_tutorial(request):
    if not request.user.groups.filter(name='Recepcao Admin').exists():
        return Response({'error': 'Sem permissão'}, status=status.HTTP_403_FORBIDDEN)
    serializer = TutorialSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(
            criado_por=request.user.username,
            atualizado_por=request.user.username
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)