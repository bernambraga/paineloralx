from django.db import models

class SACMotivosNegativos(models.Model):
    motivo = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.motivo
    
    class Meta:
        db_table = 'SACMotivosNegativos'

class SAC(models.Model):
    data = models.DateField(max_length=100, db_column='Data')
    status = models.CharField(max_length=255, db_column='Status')
    bot_status = models.CharField(max_length=100, db_column='Bot_Status', null=True, blank=True)
    bot_date_time = models.CharField(max_length=50, db_column='Bot_DateTime', null=True, blank=True)
    resposta = models.CharField(max_length=20, db_column='Resposta', null=True, blank=True)
    motivo = models.CharField(max_length=50, db_column='Motivo', null=True, blank=True)
    obs = models.CharField(max_length=255, db_column='Obs', null=True, blank=True)
    voucher = models.CharField(max_length=30, db_column='Voucher', null=True, blank=True)
    agenda = models.CharField(max_length=255, db_column='Agenda')
    pedido = models.CharField(max_length=255, unique=True, db_column='Pedido', primary_key=True)  # Defina como chave primária
    paciente = models.CharField(max_length=255, db_column='Paciente')
    telefone = models.CharField(max_length=20, db_column='Telefone')

    class Meta:
        db_table = 'SAC'

    def __str__(self):
        return f'{self.pedido} - {self.status}'
