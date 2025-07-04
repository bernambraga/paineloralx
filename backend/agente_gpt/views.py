from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import openai
import json
from django.conf import settings
import psycopg2
from datetime import date


# Cria o cliente da nova API
client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)


@csrf_exempt
def prompt_agente(request):
    if request.method != 'POST':
        return JsonResponse({'erro': 'Método não permitido'}, status=405)

    try:
        data = json.loads(request.body)
        prompt = data.get('prompt')

        if not prompt:
            return JsonResponse({'erro': 'Prompt vazio'}, status=400)

        print(f"Prompt recebido: {prompt}")

        # Detecta comando de criação
        if "criar projeto" in prompt.lower():
            # Pede ao GPT para extrair os dados em JSON estruturado
            extraction_prompt = f"""
Extraia os dados do seguinte comando e responda apenas no formato JSON:

COMANDO:
\"{prompt}\"

Formato de saída desejado:
{{
  "nome_projeto": "...",
  "descricao": "...",
  "prioridade": "...",
  "prazo_dias": ...,
  "tarefas": ["...", "...", "..."]
}}
"""

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Você extrai informações estruturadas para criar projetos e tarefas."},
                    {"role": "user", "content": extraction_prompt}
                ],
                temperature=0.2,
                timeout=15
            )

            conteudo = response.choices[0].message.content
            print("Resposta do GPT (extração):", conteudo)

            try:
                dados = json.loads(conteudo)

                from datetime import date, timedelta

                nome = dados.get("nome_projeto")
                descricao = dados.get("descricao")
                prioridade = dados.get("prioridade")
                prazo_dias = int(dados.get("prazo_dias", 10))
                tarefas = dados.get("tarefas", [])

                due_date = date.today() + timedelta(days=prazo_dias)

                # Inserir projeto
                project_id = inserir_projeto(
                    nome, descricao, prioridade, due_date)

                # Inserir tarefas
                for tarefa in tarefas:
                    inserir_tarefa(project_id, tarefa)

                return JsonResponse({
                    'resposta': f"✅ Projeto '{nome}' criado com {len(tarefas)} tarefas.",
                    'projeto_id': project_id
                })

            except json.JSONDecodeError:
                return JsonResponse({'erro': 'Não foi possível interpretar os dados extraídos pelo GPT.'}, status=500)

        # Caso: listar tarefas de um projeto
        elif "listar tarefas" in prompt.lower():
            # Extração do nome do projeto com GPT
            extraction_prompt = f"""
Extraia apenas o nome do projeto mencionado no comando abaixo. Responda apenas em JSON:

COMANDO:
\"{prompt}\"

Formato esperado:
{{ "nome_projeto": "..." }}
"""

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system",
                        "content": "Você extrai nomes de projetos de comandos naturais."},
                    {"role": "user", "content": extraction_prompt}
                ],
                temperature=0.2
            )

            try:
                dados = json.loads(response.choices[0].message.content)
                nome_projeto = dados.get("nome_projeto")
                print(f"[GPT] Nome do projeto extraído: {nome_projeto}")

                project_id = buscar_project_id_por_nome(nome_projeto)

                if not project_id:
                    return JsonResponse({'erro': f"Projeto '{nome_projeto}' não encontrado."}, status=404)

                tarefas = listar_tarefas_do_projeto(project_id)
                return JsonResponse({
                    'resposta': f"Tarefas do projeto '{nome_projeto}':",
                    'tarefas': tarefas
                })

            except Exception as e:
                print(f"[ERRO] Falha ao interpretar resposta do GPT: {e}")
                return JsonResponse({'erro': 'Falha ao extrair nome do projeto.'}, status=500)

        else:
            # Resposta comum para outros prompts
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Você é um agente de produtividade e gerenciamento de projetos."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                timeout=15
            )

            answer = response.choices[0].message.content
            print("Resposta da OpenAI:", answer)

            return JsonResponse({'resposta': answer})

    except openai.OpenAIError as e:
        print("Erro da API OpenAI:", e)
        return JsonResponse({'erro': str(e)}, status=500)

    except Exception as e:
        print("Erro inesperado:", e)
        return JsonResponse({'erro': f"Erro inesperado: {str(e)}"}, status=500)


connection_params = {
    'dbname': 'Projects',
    'user': 'oralx',
            'password': 'Tomografia',
            'host': '191.252.202.133',
            'port': '5432'
}

connection_params = {
    'dbname': 'Projects',
    'user': 'oralx',
    'password': 'Tomografia',
    'host': '191.252.202.133',
    'port': '5432'
}


def inserir_projeto(name, description, priority, due_date):
    print(f"[DB] Iniciando inserção de projeto: {name}")
    try:
        conn = psycopg2.connect(**connection_params)
        cur = conn.cursor()
        print("[DB] Conexão estabelecida.")

        cur.execute("""
            INSERT INTO "Projects" (name, description, priority, due_date)
            VALUES (%s, %s, %s, %s)
            RETURNING id;
        """, (name, description, priority, due_date))

        project_id = cur.fetchone()[0]
        conn.commit()
        print(f"[DB] Projeto inserido com ID: {project_id}")
        return project_id

    except Exception as e:
        print(f"[ERRO] Falha ao inserir projeto: {e}")
        raise

    finally:
        cur.close()
        conn.close()
        print("[DB] Conexão encerrada.")


def listar_tarefas_do_projeto(project_id):
    print(f"[DB] Buscando tarefas do projeto ID: {project_id}")
    try:
        conn = psycopg2.connect(**connection_params)
        cur = conn.cursor()
        print("[DB] Conexão estabelecida.")

        cur.execute("""
            SELECT id, name, status, deadline, notes
            FROM "Tasks"
            WHERE project_id = %s
            ORDER BY deadline;
        """, (project_id,))

        tarefas = cur.fetchall()
        print(f"[DB] {len(tarefas)} tarefas encontradas.")

        lista_formatada = [
            {
                'id': t[0],
                'nome': t[1],
                'status': t[2],
                'prazo': t[3].isoformat() if t[3] else None,
                'notas': t[4]
            } for t in tarefas
        ]
        return lista_formatada

    except Exception as e:
        print(f"[ERRO] Falha ao listar tarefas: {e}")
        raise

    finally:
        cur.close()
        conn.close()
        print("[DB] Conexão encerrada.")


def inserir_tarefa(project_id, name):
    print(
        f"[DB] Iniciando inserção de tarefa '{name}' no projeto ID: {project_id}")
    try:
        conn = psycopg2.connect(**connection_params)
        cur = conn.cursor()
        print("[DB] Conexão estabelecida.")

        cur.execute("""
            INSERT INTO "Tasks" (project_id, name)
            VALUES (%s, %s);
        """, (project_id, name))

        conn.commit()
        print(f"[DB] Tarefa '{name}' inserida com sucesso.")

    except Exception as e:
        print(f"[ERRO] Falha ao inserir tarefa '{name}': {e}")
        raise

    finally:
        cur.close()
        conn.close()
        print("[DB] Conexão encerrada.")


def buscar_project_id_por_nome(nome_projeto):
    print(f"[DB] Buscando ID do projeto: {nome_projeto}")
    try:
        conn = psycopg2.connect(**connection_params)
        cur = conn.cursor()
        cur.execute("""
            SELECT id FROM "Projects"
            WHERE LOWER(name) = LOWER(%s)
            LIMIT 1;
        """, (nome_projeto,))
        resultado = cur.fetchone()
        return resultado[0] if resultado else None
    except Exception as e:
        print(f"[ERRO] Falha ao buscar projeto: {e}")
        return None
    finally:
        cur.close()
        conn.close()
        print("[DB] Conexão encerrada.")


def listar_tarefas(request, project_id):
    try:
        tarefas = listar_tarefas_do_projeto(project_id)
        return JsonResponse({'tarefas': tarefas})
    except Exception as e:
        return JsonResponse({'erro': f'Erro ao listar tarefas: {str(e)}'}, status=500)