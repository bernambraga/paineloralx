from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
import os
from django.views import View

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        if not serializer.is_valid():
            # Check if user exists
            user_exists = User.objects.filter(username=request.data.get('username')).exists()
            if not user_exists:
                return Response({'error': 'Usuário incorreto.'}, status=status.HTTP_400_BAD_REQUEST)

            # If user exists, it must be a password issue
            return Response({'error': 'Senha incorreta.'}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })

class Logout(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        request.user.auth_token.delete()
        return Response(status=204)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = [AllowAny]  # Permitir acesso anônimo

    def get(self, request):
        return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE')})

class UserDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'username': user.username,
            'email': user.email,
        })
    
class LogView(View):
    def get(self, request):
        log_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'logfile.log')
        print(f"Reading log file from: {log_file_path}")  # Debugging information
        try:
            with open(log_file_path, 'r') as file:
                logs = file.readlines()
            print(f"Log contents: {logs}")  # Debugging information
            return JsonResponse({'logs': logs, 'log_file_path': log_file_path}, safe=False)
        except FileNotFoundError:
            print("Log file not found")  # Debugging information
            return JsonResponse({'error': 'Log file not found', 'log_file_path': log_file_path}, status=404)