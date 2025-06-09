from django.contrib.auth.models import User
from django.db import models

class Unidade(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome

# Adiciona o campo 'unidades' ao modelo User diretamente (fora da classe UserProfile)
User.add_to_class('unidades', models.ManyToManyField(Unidade, blank=True))