from django.db import models

class Pedido(models.Model):
    data = models.DateField()
    solicitante = models.CharField(max_length=255)
    cro = models.CharField(max_length=20, null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(max_length=255, null=True, blank=True)
    pedido = models.CharField(max_length=100, unique=True, db_column='pedido', primary_key=True)
    agenda = models.CharField(max_length=100)
    codigo_paciente = models.CharField(max_length=100)
    paciente = models.CharField(max_length=255, null=True, blank=True)
    convenio = models.CharField(max_length=100, null=True, blank=True)
    exame = models.CharField(max_length=255, null=True, blank=True)
    modalidade = models.CharField(max_length=50, null=True, blank=True)
    valor_pago = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'Pedidos'

    def __str__(self):
        return f"Pedido {self.pedido} - Paciente {self.paciente} - Dentista {self.solicitante}"
