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
