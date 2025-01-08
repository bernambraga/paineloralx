from django.db import models

class Senha(models.Model):
    TIPOS = [
        ('prioritario', 'Prioritário'),
        ('agendado', 'Agendado'),
        ('nao_agendado', 'Não Agendado'),
        ('retirada_exames', 'Retirada de Exames'),
    ]

    UNIDADES = [
        ('pinheiros', 'Pinheiros'),
        ('9julho', '9 de Julho'),
        ('angelica', 'Angelica'),
        ('tatuape', 'Tatuape'),
    ]

    tipo = models.CharField(max_length=20, choices=TIPOS)
    unidade = models.CharField(max_length=20, choices=UNIDADES)
    numero = models.IntegerField()
    data_criacao = models.DateField(auto_now_add=True)
    hora_criacao = models.TimeField(auto_now_add=True)

    class Meta:
        db_table = 'Senhas'
        unique_together = ('tipo', 'unidade', 'data_criacao', 'id')  # Reseta diariamente por unidade e tipo

    def __str__(self):
        return f"{self.tipo.upper()}-{self.numero} ({self.data_criacao})"
