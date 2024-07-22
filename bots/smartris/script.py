import pandas as pd
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup
import os
import logging
import re
import psycopg2
from psycopg2 import sql

# Configurar logging
log_file = "logfile.log"
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
def clean_dataframe(df):
    try:
        # Remover linhas com telefones duplicados, valores 0 ou vazios
        df.loc[:, 'Telefone'] = df['Telefone'].apply(lambda x: re.sub(r'\D', '', x))
        df = df.drop_duplicates(subset=['Telefone'])
        df = df[df['Telefone'].apply(lambda x: bool(re.match(r'^\d{10,11}$', x)) and '0000000' not in x)]
        
        return df
    except KeyError as ke:
        logging.error(f"Erro de chave no DataFrame: {ke}")
        raise
    except Exception as e:
        logging.error(f"Erro ao limpar o DataFrame: {e}")
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
                    "Status" VARCHAR(20),
                    "Agenda" VARCHAR(255),
                    "Pedido" VARCHAR(255) UNIQUE,
                    "Procedimento" VARCHAR(255),
                    "Paciente" VARCHAR(255),
                    "Telefone" VARCHAR(20),
                    "Carteirinha" VARCHAR(255),
                    "Convênio" VARCHAR(255),
                    "Encaixe" VARCHAR(10)
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

# Função para buscar e inserir lembretes do dia seguinte
def fetch_and_insert_tomorrow_appointments(conn):
    tomorrow_str = (datetime.today() + timedelta(days=1)).strftime('%Y-%m-%d')
    df_tomorrow = fetch_dataframe(tomorrow_str)
    
    df_lembretes = df_tomorrow[df_tomorrow['Status'] == 'Agendado']
    df_lembretes = clean_dataframe(df_lembretes)
    
    create_table_if_not_exists(conn, 'SAC_SmartRis_Lembretes')
    insert_dataframe_to_db(conn, df_lembretes, 'SAC_SmartRis_Lembretes')

# Função principal
def main():
    date_str = datetime.today().strftime('%Y-%m-%d')
    df = fetch_dataframe(date_str)
    
    df_agendado = df[df['Status'] == 'Agendado']
    df_finalizado = df[df['Status'] == 'Finalizado']
    
    df_agendado = clean_dataframe(df_agendado)
    df_finalizado = clean_dataframe(df_finalizado)
    
    conn = connect_to_db()
    try:
        create_table_if_not_exists(conn, 'SAC_SmartRis_Agendado')
        create_table_if_not_exists(conn, 'SAC_SmartRis_Finalizado')
        insert_dataframe_to_db(conn, df_agendado, 'SAC_SmartRis_Agendado')
        insert_dataframe_to_db(conn, df_finalizado, 'SAC_SmartRis_Finalizado')
        
        # Buscar e inserir lembretes do dia seguinte
        fetch_and_insert_tomorrow_appointments(conn)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
