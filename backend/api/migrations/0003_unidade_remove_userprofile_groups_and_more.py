# Generated by Django 4.0.1 on 2025-06-09 03:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_userprofile_remove_user_groups_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Unidade',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=100)),
            ],
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='groups',
        ),
        migrations.AddField(
            model_name='userprofile',
            name='unidade',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.unidade'),
        ),
    ]
