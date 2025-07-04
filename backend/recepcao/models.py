from django.db import models

class Tutorial(models.Model):
    titulo = models.CharField(max_length=255)
    conteudo_html = models.TextField()
    criado_em = models.DateTimeField(auto_now_add=True)
    criado_por = models.CharField(max_length=150, blank=True, null=True)
    atualizado_em = models.DateTimeField(auto_now=True)
    atualizado_por = models.CharField(max_length=150, blank=True, null=True)

    def __str__(self):
        return self.titulo
