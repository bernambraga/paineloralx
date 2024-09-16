import pandas as pd
import psycopg2
from psycopg2 import sql
import re
import os
import glob
import xlrd

# Parâmetros de conexão
connection_params = {
    'dbname': 'dev_paineloralx',
    'user': 'oralx_dev',
    'password': 'Tomografia',
    'host': '191.252.202.133',
    'port': '5432'
}


# fazer selenium para baixar o report

###############
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.service import Service as ChromeService
from datetime import datetime
import time
import os
import shutil

def download_wait(path_to_downloads, new_filename, target_folder="Selenium_Files", timeout = 15):
    seconds = 0
    dl_wait = True
    # Wait for the download to complete
    while dl_wait and seconds < timeout:
        time.sleep(1)
        for fname in os.listdir(path_to_downloads):
            if fname.endswith('.xls'):
                dl_wait = False
        seconds += 1
    # Check for the existence of the .xls file and rename/move it
    for fname in os.listdir(path_to_downloads):
        if fname.endswith('.xls'):
            # Create the target folder if it doesn't exist
            target_path = os.path.join(path_to_downloads, target_folder)
            if not os.path.exists(target_path):
                os.makedirs(target_path)
            # Define the source and destination file paths
            src = os.path.join(path_to_downloads, fname)
            print(target_path)
            print(new_filename)
            dest = os.path.join(target_path, new_filename)
            # Rename and move the file
            shutil.move(src, dest)
            break
    return seconds
    
# Set login credentials and other parameters
username = 'bernardo.braga'
password = '1234'
website_url = 'https://oralx.smartris.com.br'
report_page_url = 'https://oralx.smartris.com.br/ris/admin_reports'
report_dropdown_option = 'Dentistas Solicitantes (pr'

# Define date range
start_date = datetime(2024, 9, 1)
end_date = datetime(2024, 9, 5)
start_date_str = start_date.strftime('%d/%m/%Y')
end_date_str = end_date.strftime('%d/%m/%Y')

# Create a new Chrome WebDriver
cService = ChromeService(executable_path='/home/berna/Projects/chromedriver')
driver = webdriver.Chrome(service=cService)

# Folder and Download Info
path_to_downloads = '/home/berna/Downloads'
new_filename = 'Relatorio_' + str(start_date.strftime('%d-%m-%Y')) + '.xls'

try:
    # Open the website
    driver.get(website_url)
    time.sleep(2)  # Wait for the page to load (adjust this delay as necessary)

    # Login
    username_input = driver.find_element(By.NAME, 'username')
    password_input = driver.find_element(By.NAME, 'password')
    login_button = driver.find_element(By.ID, 'submit-button')

    username_input.send_keys(username)
    password_input.send_keys(password)
    login_button.click()
    time.sleep(1)  # Wait for the login to complete (adjust this delay as necessary)

    # Navigate to the report page
    driver.get(report_page_url)
    time.sleep(1)  # Wait for the page to load (adjust this delay as necessary)

    # Wait for the dropdown to exist and select the report option
    WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'chzn-container')]")))
    report_dropdown = driver.find_element(By.XPATH, "//div[contains(@class, 'chzn-container')]")
    report_dropdown.click()
    
    actions = ActionChains(driver)
    actions.send_keys(report_dropdown_option)
    actions.send_keys(Keys.ENTER)
    actions.perform()
    
    # Set date range
    start_date_input = driver.find_element(By.ID, 'from')
    end_date_input = driver.find_element(By.ID, 'to')
    start_date_input.clear()
    start_date_input.send_keys(start_date_str)
    end_date_input.clear()
    end_date_input.send_keys(end_date_str)

    # Find and click the download button
    download_button = driver.find_element(By.XPATH, '//a[contains(text(), "Gerar arquivo")]')
    download_button.click()

    # Find and click the excel button
    WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.ID, 'excel-opt')))
    excel_button = driver.find_element(By.ID, 'excel-opt')
    driver.execute_script("arguments[0].click();", excel_button)

    # Wait for the download to complete
    download_wait(path_to_downloads, new_filename, 120)
    
except Exception as e:
    print(f"An error occurred: {e}")

finally:
    # Close the browser window
    driver.quit()

target_folder="Selenium_Files"
target_path = os.path.join(path_to_downloads, target_folder)
fname = "report.xls"
src = os.path.join(path_to_downloads, fname)
dest = os.path.join(target_path, new_filename)
print(f"Source path: {src}")
print(f"Destination path: {dest}")
print(f"Target folder path: {target_path}")
download_wait(path_to_downloads, new_filename, 120)



#Codigo do jupyter
#################

# Ler o arquivo Excel
executable_path = os.path.dirname(os.path.abspath(__file__))
xls_files = glob.glob(os.path.join(executable_path, '*.xls'))

dataframes = []  # Create an empty list to store DataFrames
for file in xls_files:
    workbook = xlrd.open_workbook(file, ignore_workbook_corruption=True)
    dfaux = pd.read_excel(workbook)
    dfaux = dfaux.drop(dfaux.index[-1])
    dataframes.append(dfaux)
df=pd.concat(dataframes,ignore_index=True)





# Função para tratar e validar telefones
def tratar_telefone(row):
    # Extrair os números de telefone
    telefone1 = re.sub(r'\D', '', str(row['Telefone 1']))  # Remove todos os caracteres não numéricos
    telefone2 = re.sub(r'\D', '', str(row['Telefone 2']))  # Remove todos os caracteres não numéricos
    
    # Função para verificar e formatar o número de celular
    def validar_telefone(telefone):
        # Adiciona o DDD padrão se o número não tiver DDD
        if len(telefone) == 8 or len(telefone) == 9:  # Sem DDD, formato 9XXXXXXX ou 9XXXXXXXX
            telefone = '11' + telefone
        
        # Verifica se o número tem 11 dígitos e começa com '9' após o DDD (número de celular válido)
        if len(telefone) == 11 or len(telefone) == 10:
            return telefone
        return None
    
    # Priorizar o Telefone 2, se válido, senão verificar o Telefone 1
    telefone_validado = validar_telefone(telefone2)
    if telefone_validado:
        return telefone_validado
    return validar_telefone(telefone1)



# Converter a coluna 'Data' para o formato yyyy-mm-dd
df['Data'] = pd.to_datetime(df['Data'], format='%d/%m/%Y').dt.strftime('%Y-%m-%d')

# Tratar telefones
df['Telefone'] = df.apply(tratar_telefone, axis=1)

# Converter a coluna 'Valor Pago' para numérica, se necessário
df['Valor Pago'] = pd.to_numeric(df['Valor Pago'], errors='coerce')

# Filtrar as linhas onde 'Valor Pago' é maior que 0
df = df[df['Valor Pago'] > 0]

# Remover colunas desnecessárias
colunas_para_remover = ['Autorização', 'Obs', 'Dentistas Solicitantes', 'Logradouro', 'Número', 'Bairro', 'Cidade', 'Complemento', 'CEP', 'Telefone 1', 'Telefone 2']
df = df.drop(columns=colunas_para_remover)

# Conectar ao banco de dados PostgreSQL
conn = psycopg2.connect(**connection_params)
cursor = conn.cursor()

# Inserir dados na tabela pedidos
insert_query = sql.SQL("""
    INSERT INTO Public."Pedidos" (data, solicitante, cro, telefone, email, pedido, agenda, codigo_paciente, paciente, convenio, exame, modalidade, valor_pago)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
""")

# Loop para inserir cada linha
for _, row in df.iterrows():
    cursor.execute(insert_query, (
        row['Data'], row['Solicitante'], row['CRO'], row['Telefone'], row['Email'], row['Pedido'], row['Agenda'],
        row['Código do paciente'], row['Paciente'], row['Convênio'], row['Exame'], row['Modalidade'], row['Valor Pago']
    ))

# Commit das transações
conn.commit()

# Fechar a conexão
cursor.close()
conn.close()

print("Dados inseridos com sucesso!")
