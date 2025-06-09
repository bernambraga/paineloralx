from rest_framework import serializers
from .models import Modelos

class Modelos3DSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modelos
        fields = '__all__'
