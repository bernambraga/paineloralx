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
        # Exames
        cursor.execute("SELECT * FROM vw_pacientes_exames_por_modalidade ORDER BY mes ASC, ano ASC")
        exames = cursor.fetchall()

    data = {
        'exames_mensal': [
            {'mes': row[0], 'ano': row[1], 'modalidade': row[2], 'total_pacientes': row[3], 'total_exames': row[4], 'total_valor': row[5]} for row in exames
        ]
    }
    return JsonResponse(data)

def get_top_15_solicitantes(request):
    with connection.cursor() as cursor:
        cursor.execute("""WITH top_15_solicitantes AS (
                            SELECT solicitante, 
                                SUM(total_valor) AS total_ultimo_3_meses
                            FROM public.vw_clientes_exames_ct
                            WHERE mes >= (CURRENT_DATE - INTERVAL '4 months')
                            GROUP BY solicitante
                            ORDER BY total_ultimo_3_meses DESC
                            LIMIT 16
                        )
                        SELECT vw.*
                        FROM public.vw_clientes_exames_ct vw
                        JOIN top_15_solicitantes top15
                        ON vw.solicitante = top15.solicitante WHERE ano = '2024'
                        ORDER BY top15.total_ultimo_3_meses DESC, vw.solicitante;""")
        top_solicitantes = cursor.fetchall()

    data = [
        {
            'solicitante': row[0].title(),
            'mes': row[1],
            'ano': row[2],
            'total_exames': row[3],
            'total_valor': row[4]
        }
        for row in top_solicitantes
    ]

    return JsonResponse(data, safe=False)
