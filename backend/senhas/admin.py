from django.contrib import admin
from .models import Senha

@admin.register(Senha)
class SenhaAdmin(admin.ModelAdmin):
    list_display = ('tipo', 'unidade', 'numero', 'data_criacao', 'hora_criacao')
    list_filter = ('tipo', 'unidade', 'data_criacao')
