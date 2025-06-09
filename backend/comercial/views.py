from django.shortcuts import render
import os
from django.db import connection
from django.http import JsonResponse, HttpResponse
from datetime import datetime


# # Create your views here.
# SELECT * FROM public.vw_clientes_exames_ct
# where public.vw_clientes_exames_ct.ano='2024'
# and public.vw_clientes_exames_ct.mes='2024-08-01 00:00:00+00'
# order by total_valor desc
# limit 16


def get_grafico_geral(request):
    with connection.cursor() as cursor:
        # Exames
        cursor.execute(
            "SELECT * FROM vw_pacientes_exames_por_modalidade ORDER BY mes ASC, ano ASC")
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
                            WHERE mes >= (CURRENT_DATE - INTERVAL '4 months') and solicitante <>'.'
                            GROUP BY solicitante
                            ORDER BY total_ultimo_3_meses DESC
                            LIMIT 15
                        )
                        SELECT vw.*
                        FROM public.vw_clientes_exames_ct vw
                        JOIN top_15_solicitantes top15
                        ON vw.solicitante = top15.solicitante
                        WHERE ano IN (EXTRACT(YEAR FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE) - 1)
                        ORDER BY top15.total_ultimo_3_meses DESC, vw.solicitante, ano desc, mes desc;""")
        top_solicitantes = cursor.fetchall()

    data = [
        {
            'solicitante': row[0].title(),
            'mes': int(str(row[1]).split('-')[1]),
            'ano': row[2],
            'total_exames': row[3],
            'total_valor': row[4]
        }
        for row in top_solicitantes
    ]

    return JsonResponse(data, safe=False)


def get_solicitantes(request):
    with connection.cursor() as cursor:
        cursor.execute(
            """SELECT distinct trim(solicitante) FROM public."Pedidos"
            WHERE solicitante not in ('-','.') order by trim(solicitante)"""
        )
        solicitantes = cursor.fetchall()
        solicitantes_lista = [s[0] for s in solicitantes]
        # Retornando um JSON válido
        return JsonResponse({"solicitantes": solicitantes_lista}, safe=False)



def dictfetchall(cursor):
    """Converte os resultados da consulta em uma lista de dicionários"""
    columns = [col[0] for col in cursor.description]
    results = []
    
    for row in cursor.fetchall():
        row_dict = dict(zip(columns, row))
        
        # Convertendo datetime para número do mês
        if 'mes' in row_dict and isinstance(row_dict['mes'], datetime):
            row_dict['mes'] = row_dict['mes'].month  # Apenas o número do mês
        
        results.append(row_dict)
    
    return results

def get_solicitante_details(request):
    solicitante = request.GET.get('solicitante')
    print(f"Buscando detalhes para: {solicitante}")  # Debug

    if not solicitante:
        return JsonResponse({"erro": "O parâmetro 'solicitante' é obrigatório."}, status=400)

    try:
        with connection.cursor() as cursor:
            # Buscar pacientes por solicitante
            cursor.execute(
                """SELECT * FROM public.vw_pacientes_por_solicitante 
                WHERE TRIM(solicitante) = trim(%s) 
                AND ano IN (EXTRACT(YEAR FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE) - 1)"""
                , [solicitante]
            )
            totalModalidade = dictfetchall(cursor)  # Converte para dicionário
            print(f"totalModalidade: {totalModalidade}")  # Debug

            # Buscar informações básicas do solicitante
            cursor.execute(
                """SELECT * FROM public."Solicitantes" WHERE trim(nome) = trim(%s)""", [solicitante]
            )
            info = dictfetchall(cursor)  # Converte para dicionário
            print(f"Info: {info}")  # Debug
            

            # Buscar pontuação e ranking
            cursor.execute(
                """SELECT pontuacao, ultimo_mes_com_exames, total_exames 
                   FROM public.vw_ranking_solicitantes_ultimos_12_meses 
                   WHERE trim(solicitante) = trim(%s)""", [solicitante]
            )
            pontuacao = dictfetchall(cursor)  # Converte para dicionário
            print(f"Pontuação e ranking: {pontuacao}")  # Debug

    except Exception as e:
        print(f"Erro na consulta SQL: {str(e)}")  # Debug para log
        return JsonResponse({"erro": f"Erro ao buscar dados do solicitante: {str(e)}"}, status=500)

    # Retornando um JSON estruturado
    return JsonResponse({
        "totalModalidade": totalModalidade,
        "info": info,
        "pontuacao": pontuacao
    }, safe=False)
