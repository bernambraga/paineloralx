from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
import logging

from .serializers import UserSerializer

logger = logging.getLogger('django')

@ensure_csrf_cookie
def get_csrf_token(request):
    logger.info('CSRF cookie set')
    return JsonResponse({"message": "CSRF cookie set"})

class CustomLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"detail": "Username e senha são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)

        if user is None:
            # Verifica se o usuário existe mas a senha está errada
            if User.objects.filter(username=username).exists():
                return Response({"detail": "Senha incorreta"}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                return Response({"detail": "Usuário não existe"}, status=status.HTTP_404_NOT_FOUND)

        # Login válido → gera tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])  # ou use sua permissão customizada
def new_user(request):
    data = request.data
    try:
        user = User.objects.create_user(
            username=data['username'],
            email=data.get('email', ''),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            password=data['password']
        )

        # Adiciona grupos se existirem
        if 'groups' in data:
            for group_name in data['groups']:
                group = Group.objects.get(name=group_name)
                user.groups.add(group)

        user.save()
        return Response({"success": True, "user_id": user.id})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@permission_classes([IsAdminUser])
def reset_pass(request):
    username = request.data.get('username')
    nova_senha = request.data.get('nova_senha')

    try:
        user = User.objects.get(username=username)
        user.set_password(nova_senha)
        user.save()
        return Response({"success": True})
    except User.DoesNotExist:
        return Response({"error": "Usuário não encontrado"}, status=404)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def delete_user(request):
    username = request.data.get('username')
    try:
        user = User.objects.get(username=username)
        user.delete()
        return Response({'success': True})
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@permission_classes([IsAdminUser])
def getgroups(request):
    grupos = Group.objects.all().values_list('name', flat=True)
    return Response(list(grupos))

@api_view(['POST'])
@permission_classes([IsAdminUser])
def update_user(request):
    try:
        user = User.objects.get(username=request.data['username'])
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        
        if 'groups' in request.data:
            user.groups.clear()
            for group_name in request.data['groups']:
                group = Group.objects.get(name=group_name)
                user.groups.add(group)

        user.save()
        return Response({'success': True})
    except Exception as e:
        return Response({'error': str(e)}, status=400)
