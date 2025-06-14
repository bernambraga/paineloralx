#api models.py

from django.contrib.auth.models import User
from django.db import models

class Unidade(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome

# Adiciona o campo 'unidades' ao modelo User diretamente (fora da classe UserProfile)
User.add_to_class('unidades', models.ManyToManyField(Unidade, blank=True))

class Log(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    level = models.CharField(max_length=20)
    message = models.TextField()
    user_id = models.IntegerField(null=True, blank=True)
    endpoint = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"[{self.timestamp}] {self.level}: {self.message[:50]}"