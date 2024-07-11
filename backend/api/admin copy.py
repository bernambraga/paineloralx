from django.contrib import admin
from api.models import User,Profile

class UserAdmin(admin.modelAdmin):
    list_display = ['username', 'date_joined', 'is_active']

class ProfileAdmin(admin.ModelAdmin):
    list_editable = ['is_staff']
    list_display = ['user','full_name', 'is_staff']

admin.site.register(User,UserAdmin)
admin.site.register(Profile,ProfileAdmin)