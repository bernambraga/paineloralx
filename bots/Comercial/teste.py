import pandas as pd
import re
import os
import glob

def normalize_patient_name(name):
    if not isinstance(name, str):
        # Se o valor não for uma string, retorna uma string vazia ou o próprio valor.
        return ""
    
    # Define palavras-chave para remover dos nomes dos pacientes
    keywords_to_remove = ['ANGELICA', 'PINHEIROS', '9 JULHO', '9 DE JULHO', '-', '  ',' - ','-  ']
    
    # Converte o nome para maiúsculas e remove palavras desnecessárias
    for keyword in keywords_to_remove:
        name = re.sub(rf'\b{keyword}\b', '', name, flags=re.IGNORECASE)
    
    # Remove espaços extras
    name = name.strip()
    
    return name


def normalize_file(file_path):
    # Load the Excel file
    df = pd.read_excel(file_path)
    
    # Standardize column names to uppercase
    df.columns = df.columns.str.strip().str.upper()

    # Determine the patient column (it can be 'NOME' or 'PACIENTE')
    patient_column = 'NOME' if 'NOME' in df.columns else 'PACIENTE'

    # Extrair a data do nome do arquivo se a coluna "DATA" não estiver presente
    file_name = os.path.basename(file_path)
    date_from_file = file_name.split('.')[0].split('_')[1].split('-')[0:3]
    date=date_from_file[0]+"-"+date_from_file[1]+"-"+date_from_file[2].split(' ')[0]
    print(date)
    df['DATA'] = date

    # Normalize patient names by removing location-related terms
    df['PACIENTE_NORMALIZADO'] = df[patient_column].apply(normalize_patient_name)
    
    # Create a new column 'RESPOSTA' to store the response (Positivo or Negativo)
    df['RESPOSTA'] = df.apply(lambda row: 'Positiva' if pd.notna(row['POSITIVO']) else 'Negativa' if pd.notna(row['NEGATIVO']) else None, axis=1)

    # Keep only relevant columns
    df_normalized = df[['PACIENTE_NORMALIZADO', 'DATA', 'RESPOSTA']]
    
    return df_normalized

def process_files(files):
    # Process each file and normalize the data
    normalized_dataframes = []
    
    for file in files:
        normalized_df = normalize_file(file)
        normalized_dataframes.append(normalized_df)
    
    # Combine all normalized data into a single DataFrame
    final_df = pd.concat(normalized_dataframes, ignore_index=True)
    
    # Save the final normalized data to a new Excel file
    final_df.to_excel(download_path+'normalized_patients_data.xlsx', index=False)

# Example usage:
download_path = '/home/berna/Downloads/sac/'
xls_files = glob.glob(os.path.join(download_path, '*.xlsx'))

process_files(xls_files)
