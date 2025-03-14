# Generated by Django 4.0.1 on 2025-01-08 00:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('senhas', '0003_alter_senha_unique_together'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='senha',
            unique_together=set(),
        ),
        migrations.AlterField(
            model_name='senha',
            name='unidade',
            field=models.CharField(choices=[('pinheiros', 'Pinheiros'), ('9julho', '9 de Julho'), ('angelica', 'Angelica'), ('tatuape', 'Tatuape')], max_length=20),
        ),
        migrations.AlterUniqueTogether(
            name='senha',
            unique_together={('tipo', 'unidade', 'data_criacao', 'id')},
        ),
    ]
