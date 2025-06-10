from django.db import models

class Modelos(models.Model):
    pedido = models.CharField(max_length=50, primary_key=True)
    codigo_paciente = models.CharField(max_length=50, null=True, blank=True)
    paciente = models.CharField(max_length=255)
    solicitante = models.CharField(max_length=255, null=True, blank=True)
    data = models.CharField(max_length=120, null=True, blank=True)
    prazo = models.CharField(max_length=100, null=True, blank=True)
    agenda = models.CharField(max_length=100, null=True, blank=True)
    exame = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=50, default='Pendente')

    class Meta:
        db_table = 'Modelos3D'
        managed = False
