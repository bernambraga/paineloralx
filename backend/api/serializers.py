from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Unidade

class UnidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidade
        fields = ['id', 'nome']

class UserSerializer(serializers.ModelSerializer):
    groups = serializers.SerializerMethodField()
    unidades = UnidadeSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'is_active', 'is_staff', 'is_superuser',
            'last_login', 'date_joined',
            'groups', 'unidades'
        ]

    def get_groups(self, obj):
        return list(obj.groups.values_list('name', flat=True))
