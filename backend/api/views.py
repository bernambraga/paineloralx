from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny  # Mudar de IsAuthenticated para AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
import logging

logger = logging.getLogger('django')


@ensure_csrf_cookie
def get_csrf_token(request):
    logger.info('CSRF cookie set')
    return JsonResponse({"message": "CSRF cookie set"})

class LoginView(TokenObtainPairView):
    logger.info('Login realizado')
    permission_classes = (AllowAny,)  # Permitir acesso público

class LogoutView(APIView):
    logger.info('Logout realizado')
    permission_classes = (AllowAny,)  # Permitir acesso público

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
