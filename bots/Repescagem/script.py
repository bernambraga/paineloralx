import psycopg2
from sqlalchemy import create_engine
from sqlalchemy.sql import text
import pandas as pd
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.common.action_chains import ActionChains
import time
import logging
import os
import re
from datetime import datetime, timedelta

# Configurar logging
log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logfile.log')
logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s:%(levelname)s:%(message)s')

class SeleniumAutomation:
    def __init__(self):
        self.driver = None
        self.Status = ''
        self.standardMessageA = "Olá $$Paciente$$, tudo bem?\n\nNotamos a sua ausência no dia $$Data$$ aqui na Oral X $$Agenda$$.\n"
        self.unidades = ["Pinheiros", "Angélica", "9 de Julho"]
        self.username = 'oralx.repescagem'
        self.password = 'Mudar@360'
        self.date_str = datetime.today().strftime('%Y-%m-%d')
        #self.date_str = (datetime.today() - timedelta(days=2)).strftime('%Y-%m-%d')
        self.table = 'Repescagem'
        self.errorFlag = 0

    def connect_to_db(self):
        try:
            engine = create_engine(
                'postgresql+psycopg2://oralx_dev:Tomografia@191.252.202.133:5432/dev_paineloralx'
            )
            return engine
        except Exception as e:
            logging.error(f"Error connecting to database: {e}")
            return None

    def fetch_data_from_table(self, engine, table, date, bot_status):
        if bot_status != '':
            query = f'SELECT * FROM public."{table}" WHERE "Data" <= %s AND "Bot_Status" = %s;'
            try:
                with engine.connect() as connection:
                    df = pd.read_sql_query(query, connection, params=(date, bot_status))
                return df
            except Exception as e:
                logging.error(f"Error fetching data from table {table}: {e}")
                return None
        else:
            query = f'SELECT * FROM public."{table}" WHERE "Data" <= %s AND "Bot_Status" is null;'
            try:
                with engine.connect() as connection:
                    df = pd.read_sql_query(query, connection, params=(date,))
                return df
            except Exception as e:
                logging.error(f"Error fetching data from table {table}: {e}")
                return None

    def update_data_in_table(self, data, table):
        connection_params = {
            'dbname': 'dev_paineloralx',
            'user': 'oralx_dev',
            'password': 'Tomografia',
            'host': '191.252.202.133',
            'port': '5432'
            }
        try:
            connection = psycopg2.connect(**connection_params)
            cursor = connection.cursor()
            for index, row in data.iterrows():
                status = row['Status']
                pedido = row['Pedido']
                current_datetime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                query = f'''
                    UPDATE public."{table}" 
                    SET "Bot_Status" = %s, "Bot_DateTime" = %s 
                    WHERE "Pedido" = %s;
                '''
                cursor.execute(query, (status, current_datetime, pedido))
            connection.commit()
        except Exception as e:
            logging.error(f"Error updating data in table {table}: {e}")
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def start_selenium(self, URL):
        logging.info("Starting Selenium")
        options = webdriver.ChromeOptions()
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-gpu")
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')

        executable_path = os.path.dirname(os.path.abspath(__file__))
        chrome_driver_path = os.path.join(executable_path, 'chromedriver')

        try:
            if not os.access(chrome_driver_path, os.X_OK):
                raise PermissionError(f"'{chrome_driver_path}' não tem permissões de execução.")
            service = Service(chrome_driver_path)
            self.driver = webdriver.Chrome(service=service, options=options)
            self.driver.get(URL)
        except (PermissionError, WebDriverException) as e:
            logging.error(f"Erro ao iniciar o ChromeDriver: {e}")
            raise
        except Exception as e:
            logging.error(f"Erro inesperado ao iniciar o ChromeDriver: {e}")
            raise

    def login(self):
        if self.is_element_present("//input[@id='email']", 6):
            try:
                self.fill_text_field("//input[@id='email']", self.username, Keys.TAB)
                self.fill_text_field("//input[@id='password']", self.password, Keys.TAB)
                self.click_element("//button[@ng-click='onLogin()']")
            except Exception as e:
                logging.error(f"Erro no login: {e}")
                self.driver.quit()

    def process_data(self):
        connection = self.connect_to_db()
        if not connection:
            logging.info("Closing Selenium")
            if self.driver:
                self.driver.quit()
            return
        
        bot_status = '' if self.errorFlag == 0 else 'Erro abertura do Chat'
        df = self.fetch_data_from_table(connection, self.table, self.date_str, bot_status)
        self.errorFlag = 0
        if df is None or df.empty:
            logging.error("No data to process")
            logging.info("Closing Selenium")
            if self.driver:
                self.driver.quit()
            return

        self.fechar_novidades()
        time.sleep(1)
        self.trocar_status()
        if self.driver:
            self.iterate_df(df)
        logging.info("Closing Selenium")
        if self.driver:
            self.driver.quit()

    def iterate_df(self, df):
        df['Status'] = ''
        total_rows = len(df)
        for index, row in df.iterrows():
            logging.info(f"Enviando mensagem {index + 1} de {total_rows}...")
            personalizedMessage = self.replace_placeholders(self.standardMessageA, row)
            if len(str(row['Telefone'])) == 11:
                try:
                    retorno = self.criar_chat(row['Paciente'], row['Data'], row['Agenda'], row['Telefone'], personalizedMessage)
                    if retorno:
                        df.at[index, 'Status'] = 'OK'
                        logging.info(f"{row['Telefone']} OK!")
                    else:
                        df.at[index, 'Status'] = self.Status
                except Exception as e:
                    logging.error(e)
                    self.click_element("//button[@ng-click='onFecharModalCriarAtendimentoNovoContato()']")
                    continue
            else:
                df.at[index, 'Status'] = 'Número de Telefone Inválido'
                logging.error(f"{row['Telefone']} Número de Telefone Inválido!")
                continue
        connection = self.connect_to_db()
        if connection:
            self.update_data_in_table(df[['Pedido', 'Status']], self.table)

    def criar_chat(self, name, date, agenda, number, message):
        date = '/'.join(str(date).split('-')[::-1])
        flag = 0
        try:
            self.click_element("//div[@ng-click='onMostrarModalCriarAtendimentoNovoContato()']")
        except Exception as e:
            flag = 1
        if flag == 1:
            try:
                self.click_element("//div[@ng-click='onMostrarModalCriarAtendimentoNovoContato()']")
            except Exception as e:
                self.Status = 'Erro abertura do Chat'
                logging.error(e)
                return False
        try:
            self.select_dropdown_option("//select[@ng-model='novoAtendimentoNovoContato.canalChave']", "w")
            self.fill_text_field("//input[@id='novoAtendimentoNovoContatoTelefone']", str(number), Keys.TAB)
            self.fill_text_field("//input[@ng-model='novoAtendimentoNovoContato.nome']", f"{name}", Keys.CONTROL)
            self.select_dropdown_option("//select[@ng-model='departamentoSelecionado.departamentoId']", "r")
            self.select_dropdown_option("//select[@ng-model='departamentoSelecionado.atendenteId']", "Agendamento de exames - Oral X")
            self.click_element("//button[@ng-click='onModalCriarAtendimentoNovoContato()']")
        except Exception as e:
            self.Status = 'Erro abertura do Chat'
            self.errorFlag = 1
            logging.error(e)
            return False
        ops = self.fechar_Ops()
        if ops:
            return self.enviar_mensagem(message)
        else:
            self.Status = 'Chat Já Ativo'
            logging.error(f"{name} Erro: Ops, Chat já ativo.")
            return False

    def enviar_mensagem(self, message):
        try:
            actions = ActionChains(self.driver)
            actions.send_keys("/botrepescagem")
            actions.send_keys(Keys.ENTER)
            actions.perform()
            actions.send_keys(Keys.PAGE_UP)
            actions.send_keys(Keys.PAGE_UP)
            actions.perform()
            for line in message.split("\n"):
                actions.send_keys(line)
                actions.key_down(Keys.SHIFT)
                actions.send_keys(Keys.ENTER)
                actions.key_up(Keys.SHIFT)
            actions.send_keys(Keys.ENTER)
            actions.perform()
            return True
        except Exception as e:
            logging.error(e)
            self.Status = 'Erro Enviar Mensagem'
            return False

    def finalizarConversa(self):
        try:
            self.click_element("//span[@ng-click='onMostrarModalFinalizarAtendimento()']", 1)
        except Exception as e:
            try:
                self.click_element("//a[@class='dropdown-toggle icone m-r-0']", 1)
                self.click_element("//a[@ng-click='onMostrarModalFinalizarAtendimento()']", 1)
            except Exception as e:
                logging.error('Erro finalizarConversa')
                logging.error(e)
        finally:
            time.sleep(1)

    def fechar_novidades(self):
        if self.is_element_present("//button[@ng-click='close()']"):
            try:
                self.scroll_to_element("//button[@ng-click='close()']")
                self.click_element("//button[@ng-click='close()']", 1)
            except Exception as e:
                logging.error(e)
            finally:
                time.sleep(1)
        if self.is_element_present("//button[@ng-click='closeMegaZapNotification()']"):
            try:
                self.click_element("//button[@ng-click='closeMegaZapNotification()']", 1)
            except Exception as e:
                logging.error(e)
            finally:
                time.sleep(1)

    def fechar_Ops(self):
        try:
            self.click_element("//button[@class='confirm btn btn-lg btn-primary']", 1)
            self.click_element("//button[@ng-click='onFecharModalCriarAtendimentoNovoContato()']", 1)
            return False
        except Exception as e:
            return True
        finally:
            time.sleep(1)

    def trocar_status(self):
        try:
            self.click_element("//span[@class='mz-header-user-name ng-binding']")
            if self.driver.find_elements(By.XPATH, '//span[@class = "ng-binding"]')[0].text == "Ficar Online":
                self.click_element("//a[@ng-click='trocarStatusAtendente()']")
            else:
                self.click_element("//span[@class='mz-header-user-name ng-binding']")
        except Exception as e:
            logging.error(e)
            self.driver.quit()
        finally:
            time.sleep(1)

    def click_element(self, xpath, wait=5):
        element = WebDriverWait(self.driver, wait).until(EC.element_to_be_clickable((By.XPATH, xpath)))
        element.click()

    def fill_text_field(self, xpath, text, command=Keys.TAB, wait=5):
        self.scroll_to_element(xpath)
        text_field = WebDriverWait(self.driver, wait).until(EC.element_to_be_clickable((By.XPATH, xpath)))
        try:
            text_field.click()
            actions = ActionChains(self.driver)
            actions.key_down(Keys.CONTROL)
            actions.send_keys("a")
            actions.key_up(Keys.CONTROL)
            actions.send_keys(Keys.DELETE)
            actions.perform()
        except Exception as e:
            logging.error(e)
        text_field.send_keys(text)
        text_field.send_keys(command)

    def select_dropdown_option(self, xpath, text, wait=5):
        self.scroll_to_element(xpath)
        dropdown = WebDriverWait(self.driver, wait).until(EC.presence_of_element_located((By.XPATH, xpath)))
        dropdown.click()
        dropdown.send_keys(text)
        dropdown.send_keys(Keys.ENTER)

    def is_element_present(self, xpath, wait=3):
        try:
            WebDriverWait(self.driver, wait).until(EC.presence_of_element_located((By.XPATH, xpath)))
            return True
        except TimeoutException:
            return False

    def scroll_to_element(self, xpath):
        element = self.driver.find_element(By.XPATH, xpath)
        actions = ActionChains(self.driver)
        actions.move_to_element(element).perform()

    def wait_until_element_is_clickable(self, xpath, wait=5):
        return WebDriverWait(self.driver, wait).until(EC.element_to_be_clickable((By.XPATH, xpath)))

    def replace_placeholders(self, message, row_data):
        def replace_placeholder(match):
            placeholder = match.group(1)
            value = row_data.get(placeholder, placeholder)

            if placeholder == 'Paciente':
                value = value.split(" ")[0].title()
            elif placeholder == 'Data':
                if isinstance(value, str):
                    try:
                        value = datetime.strptime(value, '%Y-%m-%d')
                    except ValueError:
                        try:
                            value = datetime.strptime(value, '%d/%m/%Y')
                        except ValueError:
                            pass  # Se a conversão falhar, manter o valor original
                if isinstance(value, datetime):
                    value = value.strftime('%d/%m/%Y')
                else:
                    value = '/'.join(str(value).split('-')[::-1])
            elif placeholder == 'Agenda':
                if value.lower().startswith('p'):
                    value = self.unidades[0]
                elif value.lower().startswith('a'):
                    value = self.unidades[1]
                elif value.lower().startswith('9'):
                    value = self.unidades[2]
            return str(value)
        return re.sub(r'\$\$(.*?)\$\$', replace_placeholder, message)
    
    def close_chrome_processes(self):
        try:
            # Comando para fechar processos do Chrome
            os.system('pkill -f chrome')
            logging.info('Todos os processos do Chrome foram fechados.')
        except Exception as e:
            logging.error(f'Erro ao fechar processos do Chrome: {str(e)}')

if __name__ == "__main__":
    selenium_automation = SeleniumAutomation()
    try:
        while True:
            try:
                selenium_automation.start_selenium("https://painel.multi360.com.br")
                selenium_automation.login()
                selenium_automation.process_data()
                if selenium_automation.errorFlag != 1:
                    break
            except Exception as e:
                logging.error(f"Erro crítico: {e}")
                time.sleep(5)
                continue
    finally:
        selenium_automation.close_chrome_processes()
        