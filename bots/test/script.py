import datetime
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

def main():
    # Configuração do diretório e arquivo de log
    script_dir = os.path.dirname(os.path.abspath(__file__))
    log_file = os.path.join(script_dir, 'logfile.log')

    # Caminho para o chromedriver na mesma pasta do script
    chromedriver_path = os.path.join(script_dir, 'chromedriver')

    # Configurações do Selenium
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Executar o Chrome em modo headless
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    # Inicializando o WebDriver com o caminho para o chromedriver
    service = Service(chromedriver_path)
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        # Acessando o Google
        driver.get("https://www.google.com")
        
        # Obtendo o título da página
        page_title = driver.title
        
        # Escrevendo a execução e o título no log
        with open(log_file, 'a') as f:
            f.write(f"\nScript executado em: {datetime.datetime.now()}")
            f.write(f"\nTítulo da página: {page_title}\n")
    finally:
        # Fechando o WebDriver
        driver.quit()

if __name__ == "__main__":
    main()
