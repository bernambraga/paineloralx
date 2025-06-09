import os
import time
import shutil
import pandas as pd
import psycopg2
from psycopg2 import sql
import re
import glob
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.service import Service as ChromeService
import xlrd
import calendar
from datetime import datetime, timedelta
import logging

# Configurar logging
log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logfile.log')
logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s:%(levelname)s:%(message)s')


class WebScraper:
    def __init__(self, website_url, report_page_url, download_path, chrome_driver_path, username, password):
        self.website_url = website_url
        self.report_page_url = report_page_url
        self.download_path = download_path
        self.username = username
        self.password = password
        self.driver = self.init_driver(chrome_driver_path)

    def init_driver(self, chrome_driver_path):
        options = webdriver.ChromeOptions()
        options.add_argument("--window-size=1920,1080")
        # options.add_argument("--disable-gpu")
        # options.add_argument('--headless')
        # options.add_argument('--no-sandbox')
        # options.add_argument('--disable-dev-shm-usage')
        cService = ChromeService(executable_path=chrome_driver_path)
        driver = webdriver.Chrome(service=cService, options=options)
        return driver

    def login(self):
        try:
            self.driver.get(self.website_url)
            time.sleep(2)
            username_input = self.driver.find_element(By.NAME, 'username')
            password_input = self.driver.find_element(By.NAME, 'password')
            login_button = self.driver.find_element(By.ID, 'submit-button')
            username_input.send_keys(self.username)
            password_input.send_keys(self.password)
            login_button.click()
            time.sleep(1)
            logging.info('Login realizado com sucesso.')
        except Exception as e:
            logging.error(f"Erro ao realizar login: {e}", exc_info=False)

    def download_report(self, start_date_str, end_date_str, report_option, new_filename):
        try:
            self.driver.get(self.report_page_url)
            time.sleep(1)
            WebDriverWait(self.driver, 15).until(EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'chzn-container')]")))
            report_dropdown = self.driver.find_element(By.XPATH, "//div[contains(@class, 'chzn-container')]")
            report_dropdown.click()

            actions = ActionChains(self.driver)
            actions.send_keys(report_option)
            actions.send_keys(Keys.ENTER)
            actions.perform()

            start_date_input = self.driver.find_element(By.ID, 'from')
            end_date_input = self.driver.find_element(By.ID, 'to')
            start_date_input.clear()
            start_date_input.send_keys(start_date_str)
            end_date_input.clear()
            end_date_input.send_keys(end_date_str)

            download_button = self.driver.find_element(By.XPATH, '//a[contains(text(), "Gerar arquivo")]')
            download_button.click()

            WebDriverWait(self.driver, 15).until(EC.presence_of_element_located((By.ID, 'excel-opt')))
            excel_button = self.driver.find_element(By.ID, 'excel-opt')
            self.driver.execute_script("arguments[0].click();", excel_button)

            self.wait_for_download(new_filename)
        except Exception as e:
            logging.error(f"Erro ao baixar o relatório: {e}", exc_info=False)
        finally:
            self.driver.quit()

    def wait_for_download(self, new_filename, timeout=360):
        try:
            seconds = 0
            dl_wait = True
            while dl_wait and seconds < timeout:
                time.sleep(1)
                for fname in os.listdir(self.download_path):
                    if fname.endswith('.xls'):
                        dl_wait = False
                seconds += 1
            for fname in os.listdir(self.download_path):
                if fname.endswith('.xls'):
                    target_folder = self.download_path
                    if not os.path.exists(target_folder):
                        os.makedirs(target_folder)
                    shutil.move(os.path.join(self.download_path, fname), os.path.join(target_folder, new_filename))
                    break
            logging.info(f"Download do arquivo {new_filename} finalizado.")
        except Exception as e:
            logging.error(f"Erro durante o download: {e}", exc_info=False)


class ExcelProcessor:
    def __init__(self, download_path):
        self.download_path = download_path

    def read_excel_files(self):
        try:
            xls_files = glob.glob(os.path.join(self.download_path, '*.xls'))
            dataframes = []
            for file in xls_files:
                workbook = xlrd.open_workbook(file, ignore_workbook_corruption=True)
                df = pd.read_excel(workbook)
                df = df.drop(df.index[-1])
                dataframes.append((df, file))
            return dataframes
        except Exception as e:
            logging.error(f"Erro ao ler arquivos Excel: {e}", exc_info=False)

    def clean_data(self, df):
        try:
            df['Data'] = pd.to_datetime(df['Data'], format='%d/%m/%Y').dt.strftime('%Y-%m-%d')
            df['Telefone'] = df.apply(self._tratar_telefone, axis=1)
            df['Valor Pago'] = pd.to_numeric(df['Valor Pago'], errors='coerce')
            df = df[df['Valor Pago'] > 0]
            df = df.drop(columns=['Autorização', 'Obs', 'Dentistas Solicitantes', 'Logradouro', 'Número', 'Bairro',
                                  'Cidade', 'Complemento', 'CEP', 'Telefone 1', 'Telefone 2'])
            return df
        except Exception as e:
            logging.error(f"Erro ao limpar dados: {e}", exc_info=False)

    def _tratar_telefone(self, row):
        telefone1 = re.sub(r'\D', '', str(row['Telefone 1']))
        telefone2 = re.sub(r'\D', '', str(row['Telefone 2']))

        def validar_telefone(telefone):
            if len(telefone) == 8 or len(telefone) == 9:
                telefone = '11' + telefone
            if len(telefone) == 11 or len(telefone) == 10:
                return telefone
            return None

        telefone_validado = validar_telefone(telefone2)
        return telefone_validado if telefone_validado else validar_telefone(telefone1)

    def delete_file(self, file_path):
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logging.info(f"Arquivo deletado: {file_path}")
            else:
                logging.warning(f"Arquivo não encontrado: {file_path}")
        except Exception as e:
            logging.error(f"Erro ao deletar arquivo: {e}", exc_info=False)


class DatabaseManager:
    def __init__(self, connection_params):
        self.connection_params = connection_params

    def insert_data(self, df):
        try:
            conn = psycopg2.connect(**self.connection_params)
            cursor = conn.cursor()
            insert_query = sql.SQL("""
                INSERT INTO Public."Pedidos" (data, solicitante, cro, telefone, email, pedido, agenda, codigo_paciente, 
                paciente, convenio, exame, modalidade, valor_pago)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (pedido) DO NOTHING
            """)
            for _, row in df.iterrows():
                cursor.execute(insert_query, (
                    row['Data'], row['Solicitante'], row['CRO'], row['Telefone'], row['Email'], row['Pedido'],
                    row['Agenda'], row['Código do paciente'], row['Paciente'], row['Convênio'], row['Exame'],
                    row['Modalidade'], row['Valor Pago']
                ))
            conn.commit()
            cursor.close()
            conn.close()
            logging.info("Dados inseridos no banco de dados com sucesso.")
        except Exception as e:
            logging.error(f"Erro ao inserir dados no banco: {e}", exc_info=False)


def get_last_month_date_range():
    today = datetime.today()
    first_day_of_current_month = today.replace(day=1)
    last_day_of_last_month = first_day_of_current_month - timedelta(days=1)
    first_day_of_last_month = last_day_of_last_month.replace(day=1)
    return first_day_of_last_month, last_day_of_last_month


if __name__ == '__main__':
    try:
        # Parâmetros de conexão
        connection_params = {
            'dbname': 'dev_paineloralx',
            'user': 'oralx_dev',
            'password': 'Tomografia',
            'host': '191.252.202.133',
            'port': '5432'
        }

        # Informações de login e download
        website_url = 'https://oralx.smartris.com.br'
        report_page_url = 'https://oralx.smartris.com.br/ris/admin_reports'
        download_path = '/home/oralx/Downloads'
        download_path = 'C:/USERS/User/Downloads'
        executable_path = os.path.dirname(os.path.abspath(__file__))
        chrome_driver_path = os.path.join(executable_path, 'chromedriver')
        chrome_driver_path = os.path.join(executable_path, 'chromedriver.exe')
        username = 'bernardo.braga'
        password = '1234'

        # Parâmetros do relatório
        start_date, end_date = get_last_month_date_range()
        start_date_str = start_date.strftime('%d/%m/%Y')
        end_date_str = end_date.strftime('%d/%m/%Y')
        new_filename = f'Relatorio_{start_date.strftime("%d-%m-%Y")}.xls'
        report_dropdown_option = 'Dentistas Solicitantes (pr'

        # Processo de scraping
        scraper = WebScraper(website_url, report_page_url, download_path, chrome_driver_path, username, password)
        scraper.login()
        scraper.download_report(start_date_str, end_date_str, report_dropdown_option, new_filename)

        # Processamento do Excel
        processor = ExcelProcessor(download_path)
        files_and_data = processor.read_excel_files()

        for df, file_path in files_and_data:
            df_cleaned = processor.clean_data(df)

            # Inserção no banco de dados
            db_manager = DatabaseManager(connection_params)
            db_manager.insert_data(df_cleaned)

            # Após inserção, deletar o arquivo Excel
            processor.delete_file(file_path)

        logging.info("Processo concluído com sucesso!")
    except Exception as e:
        logging.error(f"Erro no processo principal: {e}", exc_info=False)
