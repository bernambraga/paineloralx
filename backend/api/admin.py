from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Unidade

class CustomUserAdmin(UserAdmin):
    model = User
    # Adiciona o campo 'unidades' e mantém os padrões
    fieldsets = UserAdmin.fieldsets + (
        ("Unidades", {'fields': ('unidades',)}),
    )
    filter_horizontal = ('groups', 'user_permissions', 'unidades')

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

# Também registre Unidade normalmente
@admin.register(Unidade)
class UnidadeAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome')
