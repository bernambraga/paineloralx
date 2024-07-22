import psycopg2
import pandas as pd
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.common.action_chains import ActionChains
import time
import inspect
import logging
import os

# Configurar logging
log_file = "logfile.log"
logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s:%(levelname)s:%(message)s')

def connect_to_db(self):
    try:
        connection = psycopg2.connect(**self.db_config)
        return connection
    except Exception as e:
        logging.error(f"Error connecting to database: {e}")
        return None

def fetch_data_from_table(self, connection):
    query = f"SELECT * FROM {self.table_name};"
    try:
        df = pd.read_sql_query(query, connection)
        return df
    except Exception as e:
        logging.error(f"Error fetching data from table {self.table_name}: {e}")
        return None

def insert_data_into_table(self, connection, data):
    cursor = connection.cursor()
    try:
        for index, row in data.iterrows():
            placeholders = ', '.join(['%s'] * len(row))
            columns = ', '.join(row.index)
            query = f"INSERT INTO {self.table_name} ({columns}) VALUES ({placeholders})"
            cursor.execute(query, tuple(row))
        connection.commit()
    except Exception as e:
        logging.error(f"Error inserting data into table {self.table_name}: {e}")
        connection.rollback()
    finally:
        cursor.close()

def start(self, URL):
    logging.info("Starting Selenium")
    options = webdriver.ChromeOptions()
    options.add_argument("--window-size=1920,1080")
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_experimental_option("detach", True)
    
    executable_path = os.path.dirname(os.path.abspath(__file__))
    chrome_driver_path = os.path.join(executable_path, 'chromedriver')

    try:
        if not os.access(chrome_driver_path, os.X_OK):
            raise PermissionError(f"'{chrome_driver_path}' não tem permissões de execução.")
        self.driver = webdriver.Chrome(executable_path=chrome_driver_path, options=options)
        self.driver.get(URL)
    except PermissionError as pe:
        logging.error(f"Permissão negada ao tentar executar o ChromeDriver: {pe}")
        input("Pressione Enter para continuar...")
        raise
    except WebDriverException as we:
        logging.error(f"Erro ao iniciar o ChromeDriver: {we}")
        input("Pressione Enter para continuar...")
        raise
    except Exception as e:
        logging.error(f"Erro inesperado ao iniciar o ChromeDriver: {e}")
        input("Pressione Enter para continuar...")
        raise
    time.sleep(2)
    self.loginMulti360()

def loginMulti360(self, username, password):
    connection = self.connect_to_db()
    if not connection:
        return
    df = self.fetch_data_from_table(connection)
    connection.close()
    
    if df is None or df.empty:
        logging.error("No data to process")
        return
    
    if self.is_element_present("//input[@id='email']",6):
        try:
            self.fill_text_field("//input[@id='email']", username, Keys.TAB)
            self.fill_text_field("//input[@id='password']", password, Keys.TAB)
            self.click_element("//button[@ng-click='onLogin()']")
        except Exception as e:
            self.utils.logErro(e)
            self.driver.quit()
    self.fechar_novidades()
    time.sleep(1)
    self.trocar_status()
    self.iterate_df(df)
    logging.info("Closing Selenium")

def iterate_df(self, df):
    df['Status'] = ''
    for index, row in df.iterrows():
        self.update_progress_callback(index)
        personalized_message = self.utils.replace_placeholders(self.standard_messageA, row)
        if len(str(row['Telefone'])) == 11:
            try:
                retorno = self.criar_chat(row['Paciente'], row['Data'], row['Agenda'], row['Telefone'], personalized_message)
                if retorno == True:
                    df.at[index, 'Status'] = 'OK'
                    logging.info(f"{row['Telefone']} OK!")
                else:
                    df.at[index, 'Status'] = self.Status
            except Exception as e:
                self.utils.logErro(e)
                self.click_element("//button[@ng-click='onFecharModalCriarAtendimentoNovoContato()']")
                continue
        else:
            df.at[index, 'Status'] = 'Número de Telefone Inválido'
            self.utils.log_error(f"{row['Telefone']} Número de Telefone Inválido!")
            continue
    connection = self.connect_to_db()
    if connection:
        self.insert_data_into_table(connection, df[['Telefone', 'Status']])
        connection.close()
    
    self.driver.quit()

# Outras funções permanecem inalteradas
