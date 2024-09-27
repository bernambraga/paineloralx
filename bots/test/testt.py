import pandas as pd
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup
import os
import logging
import re
import psycopg2
from psycopg2 import sql
import time  # Importar para usar sleep

# Configurar logging
log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logfile.log')
logging.basicConfig(filename=log_file, level=logging.INFO, format='%(asctime)s:%(levelname)s:%(message)s')

# Função para buscar o DataFrame na internet
def fetch_dataframe(date_str):
    try:
        url = "https://oralx.smartris.com.br/ris/calendar/date_schedule_report"
        
        # Payload com a data
        payload = {'date': date_str}

        # Realizar a requisição HTTP
        response = requests.post(url, data=payload)
        response.raise_for_status()  # Levanta um erro se a requisição falhar

        # Parsear o HTML e converter para DataFrame
        html_content = response.content.decode('utf-8')
        soup = BeautifulSoup(html_content, 'html.parser')
        table = soup.find('table', {'class': 'bordered'})

        # Verificar se a tabela está presente
        if not table:
            logging.warning(f"Nenhuma tabela encontrada para a data: {date_str}.")
            return pd.DataFrame()  # Retornar um DataFrame vazio

        headers = [header.text.strip() for header in table.find('thead').find_all('th')]
        rows = []
        for row in table.find('tbody').find_all('tr'):
            cols = [col.text.strip() for col in row.find_all('td')]
            rows.append(cols)

        df = pd.DataFrame(rows, columns=headers)
        
        # Adicionar coluna Data
        date_str_from_html = soup.find('h2', {'class': 'header_title'}).text.split('-')[1].strip()
        df['Data'] = pd.to_datetime(date_str_from_html, format='%d/%m/%Y').strftime('%Y-%m-%d')
        
        return df
    except requests.RequestException as req_err:
        logging.error(f"Erro na requisição HTTP: {req_err}")
        raise
    except Exception as e:
        logging.error(f"Erro ao buscar o DataFrame: {e}")
        raise

# Função para limpar o DataFrame
def clean_dataframe(df,flag=0):
    try:
        # Remover linhas com telefones duplicados, valores 0 ou vazios
        df.loc[:, 'Telefone'] = df['Telefone'].apply(lambda x: re.sub(r'\D', '', x))
        df = df.drop_duplicates(subset=['Telefone'])
        df = df.drop(columns = ["Encaixe", "Carteirinha", "Convênio", "Procedimento"])
        if flag==1:
            df = df.drop(columns = ["Hora"])
        df = df[df['Telefone'].apply(lambda x: bool(re.match(r'^\d{10,11}$', x)) and '0000000' not in x)]
        
        return df
    except KeyError as ke:
        logging.error(f"Erro de chave no DataFrame: {ke}")
        raise
    except Exception as e:
        logging.error(f"Erro ao limpar o DataFrame: {e}")
        raise

# Função para remover pacientes duplicados nos DataFrames "Agendado" e "Finalizado"
def remove_duplicate_patients(df):
    try:
        # Identificar pacientes que aparecem em ambos os estados
        pacientes_finalizados = df[df['Status'] == 'Finalizado']['Telefone']
        df = df[~((df['Status'] == 'Agendado') & (df['Telefone'].isin(pacientes_finalizados)))]
        return df
    except KeyError as ke:
        logging.error(f"Erro de chave no DataFrame: {ke}")
        raise
    except Exception as e:
        logging.error(f"Erro ao remover pacientes duplicados: {e}")
        raise

# Função para conectar ao banco de dados PostgreSQL
def connect_to_db():
    try:
        conn = psycopg2.connect(
            dbname="dev_paineloralx",
            user="oralx_dev",
            password="Tomografia",
            host="191.252.202.133",
            port="5432"
        )
        return conn
    except Exception as e:
        logging.error(f"Erro ao conectar ao banco de dados: {e}")
        raise

# Função para criar a tabela no banco de dados
def create_table_if_not_exists(conn, table_name):
    try:
        with conn.cursor() as cur:
            create_table_query = sql.SQL("""
                CREATE TABLE IF NOT EXISTS {table} (
                    "Data" DATE,
                    "Hora" VARCHAR(10),
                    "Status" VARCHAR(255),
                    "Bot_Status" VARCHAR(100),
                    "Bot_DateTime" VARCHAR(50),
                    "Agenda" VARCHAR(255),
                    "Pedido" VARCHAR(255) UNIQUE,
                    "Paciente" VARCHAR(255),
                    "Telefone" VARCHAR(20)
                )
            """).format(table=sql.Identifier(table_name))
            cur.execute(create_table_query)
            conn.commit()
    except Exception as e:
        logging.error(f"Erro ao criar a tabela: {e}")
        conn.rollback()
        raise

def create_table_if_not_exists2(conn, table_name):
    try:
        with conn.cursor() as cur:
            create_table_query = sql.SQL("""
                CREATE TABLE IF NOT EXISTS {table} (
                    "Data" DATE,
                    "Hora" VARCHAR(10),
                    "Status" VARCHAR(255),
                    "Bot_Status" VARCHAR(100),
                    "Bot_DateTime" VARCHAR(50),
                    "Resposta" VARCHAR(20),
                    "Motivo" VARCHAR(50),
                    "Obs" VARCHAR(255),
                    "Agenda" VARCHAR(255),
                    "Pedido" VARCHAR(255) UNIQUE,
                    "Paciente" VARCHAR(255),
                    "Telefone" VARCHAR(20)
                )
            """).format(table=sql.Identifier(table_name))
            cur.execute(create_table_query)
            conn.commit()
    except Exception as e:
        logging.error(f"Erro ao criar a tabela: {e}")
        conn.rollback()
        raise

# Função para inserir DataFrame no banco de dados
def insert_dataframe_to_db(conn, df, table_name):
    try:
        with conn.cursor() as cur:
            for index, row in df.iterrows():
                columns = list(row.index)
                values = [row[column] for column in columns]
                insert_statement = sql.SQL(
                    'INSERT INTO {table} ({fields}) VALUES ({values}) ON CONFLICT ("Pedido") DO NOTHING'
                ).format(
                    table=sql.Identifier(table_name),
                    fields=sql.SQL(', ').join(map(sql.Identifier, columns)),
                    values=sql.SQL(', ').join(sql.Placeholder() * len(values))
                )
                cur.execute(insert_statement, values)
            conn.commit()
    except Exception as e:
        logging.error(f"Erro ao inserir DataFrame no banco de dados: {e}")
        conn.rollback()
        raise


# Função principal modificada para rodar desde 2016 até agosto de 2024 com intervalo entre as requisições
def main():
    logging.info("Iniciando a busca de dados SmartRis")

    # Definir a data de início (01-01-2016) e a data de fim (31-08-2024)
    start_date = datetime(2016, 8, 1)
    end_date = datetime(2024, 8, 25)

    conn = connect_to_db()

    try:
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            logging.info(f"Buscando dados para a data: {date_str}")

            try:
                df = fetch_dataframe(date_str)
                df = remove_duplicate_patients(df)

                df_agendado = df[df['Status'] == 'Agendado']
                df_finalizado = df[df['Status'] == 'Finalizado']

                df_agendado = clean_dataframe(df_agendado)
                df_finalizado = clean_dataframe(df_finalizado, 1)

                create_table_if_not_exists(conn, 'Repescagem')
                insert_dataframe_to_db(conn, df_agendado, 'Repescagem')

                create_table_if_not_exists2(conn, 'SAC')
                insert_dataframe_to_db(conn, df_finalizado, 'SAC')

                # Pausar por 2 segundos entre cada requisição para não sobrecarregar a API
                time.sleep(2)

            except Exception as e:
                logging.error(f"Erro ao processar a data {date_str}: {e}")

            # Avançar para o próximo dia
            current_date += timedelta(days=1)
    finally:
        conn.close()
        logging.info("Processo concluído e conexão ao banco fechada")

if __name__ == "__main__":
    main()
