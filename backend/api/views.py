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
    permission_classes = (AllowAny,)  # Permitir acesso público

class LogoutView(APIView):
    permission_classes = (AllowAny,)  # Permitir acesso público

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


from django.contrib.auth import authenticate
from django.contrib.auth.models import User

class CustomLoginView(APIView):
    permission_classes = (AllowAny,)
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "User does not exist"}, status=401)

        user = authenticate(username=username, password=password)

        if user is not None:
            # User authenticated successfully
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Incorrect password"}, status=401)
