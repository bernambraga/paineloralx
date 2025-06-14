import os
import time
import pandas as pd
import psycopg2
from psycopg2 import sql
import re
from playwright.sync_api import sync_playwright
import logging
import sys

# Configurar logging
log_file = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), 'logfile.log')
logging.basicConfig(filename=log_file, level=logging.INFO,
                    format='%(asctime)s:%(levelname)s:%(message)s')


class DatabaseManager:
    def __init__(self, connection_params):
        self.connection_params = connection_params

    def insert_data(self, df):
        try:
            conn = psycopg2.connect(**self.connection_params)
            cursor = conn.cursor()

            insert_query = sql.SQL("""
                INSERT INTO public."Modelos3D"(
                    pedido, codigo_paciente, paciente, solicitante, data, prazo, agenda, exame, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (pedido) DO NOTHING
            """)

            for _, row in df.iterrows():
                cursor.execute(
                    insert_query,
                    (
                        row.get("Pedido"),
                        row.get("Numero_Paciente"),
                        row.get("Nome"),
                        row.get("Solicitante"),
                        row.get("Data"),
                        row.get("Prazo"),
                        row.get("Agenda"),
                        row.get("Exame"),
                        "Pendente"
                    )
                )

            conn.commit()
            cursor.close()
            conn.close()
            logging.info("Dados inseridos no banco de dados com sucesso.")
        except Exception as e:
            logging.error(
                f"Erro ao inserir dados no banco: {e}", exc_info=False)
            
    def buscar_pedidos_recentes(self):
        try:
            conn = psycopg2.connect(**self.connection_params)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT pedido FROM public."Modelos3D"
                WHERE TO_DATE(data, 'DD/MM/YYYY') >= current_date - interval '30 days'
            """)
            pedidos = [row[0] for row in cursor.fetchall()]
            cursor.close()
            conn.close()
            return set(pedidos)
        except Exception as e:
            logging.error(f"Erro ao buscar pedidos recentes: {e}")
            return set()


def esperar_linhas(page, tentativas=5, intervalo_ms=1000):
    for tentativa in range(tentativas):
        linhas = page.query_selector_all('tr.report-line')
        if linhas:
            return linhas
        logging.info(
            f"Tentativa {tentativa + 1}/{tentativas}: Nenhuma linha encontrada, aguardando...")
        page.wait_for_timeout(intervalo_ms)
    return []


def tentar_ate_sucesso(func, tentativas=3, intervalo=1000, erro_msg=""):
    for i in range(tentativas):
        try:
            return func()
        except Exception as e:
            if i < tentativas - 1:
                # intervalo está em ms, converter para s
                time.sleep(intervalo / 1000)
            else:
                logging.warning(f"{erro_msg} Tentativa {i+1} falhou: {e}")
                raise


def extrair_dados(playwright, usuario, senha):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    df = pd.DataFrame()

    page.goto('https://oralx.smartris.com.br')
    tentar_ate_sucesso(lambda: page.fill('input[name="username"]', usuario))
    page.fill('input[name="password"]', senha)
    page.click('#submit-button')
    page.wait_for_timeout(5000)

    current_url = page.url
    target_url = 'https://oralx.smartris.com.br/ris/reports_list'
    if current_url != target_url:
        page.goto(target_url)
        page.wait_for_timeout(5000)
    page.wait_for_selector('#data_mes')
    page.click('#data_mes')

    page.click('#filtros div:nth-child(5) div span.select2-selection')
    page.wait_for_selector(
        '.select2-container--open input.select2-search__field')
    page.fill('.select2-container--open input.select2-search__field', 'ber')
    page.keyboard.press('Enter')

    page.click('#full_search')
    page.wait_for_timeout(5000)

    linhas = esperar_linhas(page)
    if not linhas:
        logging.info(
            "Nenhum novo exame encontrado na listagem. Encerrando o script.")
        return 'Erro'
    dados = []

    for index, linha in enumerate(linhas):
        logging.info("Linha %s de %s", index + 1, len(linhas))
        colunas = linha.query_selector_all('td')
        try:
            prazo = colunas[2].query_selector('div').inner_text().strip()
        except:
            prazo = ''
        try:
            data = colunas[5].query_selector_all(
                'span')[1].inner_text().strip().split(" ")[0]
        except:
            data = ''
        try:
            pedido = colunas[4].query_selector(
                '.wrap-accession').inner_text().strip()
        except:
            pedido = ''
        try:
            exame = colunas[7].query_selector(
                '.wrap-exam').inner_text().strip()
        except:
            exame = ''
        try:
            nome = colunas[8].query_selector('.wrap-name').inner_text().strip()
        except:
            nome = ''
        try:
            solicitante = colunas[12].query_selector(
                '.wrap-name').inner_text().strip()
        except:
            solicitante = ''

        # Se já existir, pula a extração detalhada
        if pedido in pedidos_existentes:
            solicitante = ''
            nome = ''
            exame = ''
            data = ''
            prazo = ''
            pedido = ''
            continue
        else:
            logging.info(f"Pedido novo nº {pedido}, extração detalhada.")
            try:
                icone = page.query_selector(
                    f'i[onclick*="print_guide"][onclick*="{pedido}"]')
                icone.click()
                page.wait_for_timeout(1000)
            except Exception as e:
                logging.error(f"Erro ao clicar no icone do pedido {pedido}: {e}")
                continue
            
            def abrir_modelo():
                page.click('a.chzn-single:has-text("Escolha um modelo")')

            tentar_ate_sucesso(abrir_modelo, tentativas=3,
                            intervalo=1000, erro_msg="Erro ao selecionar modelo.")
            page.click('li:has-text("ORDEM DE SERVIÇO")')
            page.wait_for_timeout(1000)
            def get_conteudo_do_iframe():
                frame_locator = page.frame_locator('#text_models_ifr')
                return frame_locator.locator('body').inner_text()
            conteudo = ''
            conteudo = tentar_ate_sucesso(get_conteudo_do_iframe, tentativas=3, intervalo=1500,
                                        erro_msg=f"Falha ao extrair texto do iframe para pedido {pedido}")

            match_paciente = re.search(r'Paciente N°:\s*(\d+)', conteudo)
            numero_paciente = match_paciente.group(1) if match_paciente else None

            match_agenda = re.search(
                r'Data:\s+(.*?)\s*Informa', conteudo, re.DOTALL)
            agenda_completa = match_agenda.group(
                1).strip() if match_agenda else None
            agenda = agenda_completa.split(
                '-')[0].strip() if agenda_completa else None
            
            page.click('a[title="Fechar"].simplemodal-close')

            dados.append({
                'Data': data,
                'Prazo': prazo,
                'Pedido': pedido,
                'Exame': exame,
                'Nome': nome,
                'Numero_Paciente': numero_paciente,
                'Agenda': agenda,
                'Solicitante': solicitante
            })
            data = ''
            prazo = ''
            pedido = ''
            exame = ''
            nome = ''
            numero_paciente = None
            agenda = None
            solicitante = ''
            
    browser.close()
    return pd.DataFrame(dados)


if __name__ == '__main__':
    connection_params = {
        'dbname': 'dev_paineloralx',
        'user': 'oralx_dev',
        'password': 'Tomografia',
        'host': '191.252.202.133',
        'port': '5432'
    }
    connection_params = {
        'dbname': 'paineloralx',
        'user': 'oralx',
        'password': 'Tomografia',
        'host': '191.252.202.133',
        'port': '5432'
    }

    usuario = 'bernardo.braga'
    senha = '1234'

    with sync_playwright() as playwright:
        logging.info("Busca de dados iniciada.")
        db = DatabaseManager(connection_params)
        pedidos_existentes = db.buscar_pedidos_recentes()
        df = extrair_dados(playwright, usuario, senha)
        
        if not isinstance(df, pd.DataFrame):
            logging.error("Falha ao extrair dados.")
        elif df.empty:
            logging.info("Nenhum dado novo foi encontrado.")
        else:
            logging.info("Busca de dados finalizada. Inserindo dados novos no banco.")
            db.insert_data(df)
