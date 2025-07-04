import html
import os
import re
import logging
from playwright.sync_api import sync_playwright
from datetime import datetime, timedelta
import holidays
import time
from bs4 import BeautifulSoup


def esperar_linhas(page, tentativas=5, intervalo_ms=1000):
    for _ in range(tentativas):
        linhas = page.query_selector_all('tr.report-line')
        if linhas:
            return linhas
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


def baixar_anexos_da_documentacao(context, botao_documentacao, pedido_id, nome_paciente):
    try:
        # Sanitiza nome da pasta
        nome_enxuto = re.sub(r'[^A-Za-z0-9_]', '_', nome_paciente.upper().strip().replace(" ", "_"))
        pasta_destino = os.path.join(os.path.dirname(os.path.abspath(__file__)), "anexos", f"{nome_enxuto}")
        os.makedirs(pasta_destino, exist_ok=True)
        # Abre nova aba com os anexos
        botao_documentacao.evaluate("el => el.setAttribute('target', '_blank')")
        with context.expect_page() as nova_aba_info:
            botao_documentacao.click()
        page_doc = nova_aba_info.value
        page_doc.wait_for_load_state("domcontentloaded")
        page_doc.wait_for_timeout(2000)
        clipes = page_doc.query_selector_all("a.attach")
        for clipe in clipes:
            oldtitle = clipe.get_attribute("oldtitle")
            if not oldtitle or oldtitle == 'Nenhum arquivo':
                continue
            html_decodificado = html.unescape(oldtitle)
            soup = BeautifulSoup(html_decodificado, "html.parser")
            arquivos_stl = [link for link in soup.select("a.dl-attach") if link.text.strip().lower().endswith(".stl")]
            for link in arquivos_stl:
                data_id = link.get("data-id")
                nome_arquivo = link.text.strip().replace("/", "-").replace("\\", "-")  # Evita problemas no nome do arquivo

                if data_id:
                    href = f"https://oralx.smartris.com.br/ris/report/download_file/{data_id}"
                    response = context.request.get(href)
                    caminho = os.path.join(pasta_destino, nome_arquivo)
                    with open(caminho, "wb") as f:
                        f.write(response.body())
                    logging.info(f"✅ Anexo STL salvo em: {caminho}")
            break  # só o primeiro clipe relevante (MODELO DE ESTUDO)
        page_doc.close()
    except Exception as e:
        logging.error(f"❌ Erro ao baixar anexos do pedido {pedido_id}: {e}")

def main():
    usuario = 'bernardo.braga'
    senha = '1234'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        page.goto("https://oralx.smartris.com.br")
        page.fill('input[name="username"]', usuario)
        page.fill('input[name="password"]', senha)
        page.click('#submit-button')
        page.wait_for_timeout(5000)

        if page.url != 'https://oralx.smartris.com.br/ris/reports_list':
            page.goto('https://oralx.smartris.com.br/ris/reports_list')
            page.wait_for_timeout(5000)

        page.wait_for_selector('#data_mes')
        page.click('#data_mes')
        page.click('#filtros div:nth-child(5) div span.select2-selection')
        page.wait_for_selector('.select2-container--open input.select2-search__field')
        page.fill('.select2-container--open input.select2-search__field', 'ber')
        page.keyboard.press('Enter')
        page.click('#full_search')
        page.wait_for_timeout(5000)

        linhas = esperar_linhas(page)
        if not linhas:
            logging.info("Nenhum paciente encontrado.")
            return

        for index, linha in enumerate(linhas):
            try:
                pedido = linha.query_selector('.wrap-accession').inner_text().strip()
                nome = linha.query_selector('.wrap-name').inner_text().strip()
                logging.info(
                    f"[{index+1}/{len(linhas)}] Tentando baixar anexos do pedido: {pedido}")

                botao_doc = linha.query_selector('a[title="Documentação"]')
                if botao_doc:
                    baixar_anexos_da_documentacao(context, botao_doc, pedido, nome)
                else:
                    logging.warning(
                        f"Botão de documentação não encontrado para o pedido {pedido}")
            except Exception as e:
                logging.error(f"Erro ao processar linha {index+1}: {e}")

        browser.close()


if __name__ == '__main__':
    main()
