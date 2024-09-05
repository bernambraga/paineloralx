from django.shortcuts import render
import os
from django.http import JsonResponse
from django.db import connection


# # Create your views here.
# SELECT * FROM public.vw_clientes_exames_ct
# where public.vw_clientes_exames_ct.ano='2024' 
# and public.vw_clientes_exames_ct.mes='2024-08-01 00:00:00+00'
# order by total_valor desc
# limit 16



def get_grafico_geral(request):
    with connection.cursor() as cursor:
        # Exames por quantidade
        cursor.execute("SELECT * FROM vw_ct_mensal")
        exames_mensal = cursor.fetchall()

        # Exames por valor monetário
        cursor.execute("SELECT * FROM vw_ct_mensal")
        valor_mensal = cursor.fetchall()

    data = {
        'exames_mensal': [
            {'mes': row[0], 'ano': row[1], 'total_exames': row[2]} for row in exames_mensal
        ],
        'valor_mensal': [
            {'mes': row[0], 'ano': row[1], 'total_valor': row[2]} for row in valor_mensal
        ]
    }

    return JsonResponse(data)

def get_top_15_solicitantes(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM vw_top_15_clientes_exames_ct")
        top_solicitantes = cursor.fetchall()

    data = [
        {
            'solicitante': row[0],
            'mes': row[1],
            'ano': row[2],
            'total_exames': row[3],
            'total_valor': row[4]
        }
        for row in top_solicitantes
    ]

    return JsonResponse(data, safe=False)
