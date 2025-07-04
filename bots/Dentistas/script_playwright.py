from django import template
from playwright.sync_api import sync_playwright
import time

# --- CONFIGURAÇÃO ---
URL = "https://chat.proradis.com.br"
EMAIL = "ti@oralx.com.br"
SENHA = "OralX2025!"

def login_e_abrir_contatos(page):
    page.goto(URL)

    # Aguarda os campos carregarem
    page.wait_for_selector('input[id="email_address"]')
    page.fill('input[id="email_address"]', EMAIL)
    page.fill('input[id="password"]', SENHA)

    # Clica no botão de login (ajuste se necessário)
    page.click('span:has-text("Login")')
    
    # Aguarda a dashboard carregar
    page.wait_for_selector('//span[text()="CONTACTS"]')
    # Abre aba "Contatos" – ajuste o seletor se necessário
    page.click('//a[.//span[text()="CONTACTS"]]')

def criar_novo_contato(page, nome, telefone):
    # Clica no botão "Criar novo contato"
    page.click('button[data-testid="create-new-contact"]:has-text("Novo contato")')
    page.wait_for_timeout(1000)  # aguarda modal abrir

    # Preenche o campo de nome completo
    page.fill('input[placeholder="Digite o nome completo do contato"]', nome)

    # Preenche o campo de telefone
    page.fill('input[placeholder="Digite o número de telefone do contato"]', telefone)

    # Envia o formulário
    page.click('[data-testid="submit_button"]')
    page.wait_for_timeout(2000)

def abrir_conversa(page, telefone, nome, template_nome, parametros):
    # 1. Buscar contato
    page.fill('input[placeholder="Pesquisar contatos"]', telefone)
    page.keyboard.press("Enter")
    page.wait_for_timeout(1000)

    # 2. Clicar no resultado correspondente
    try:
        clicar_contato_por_telefone(page, telefone)
    except Exception as e:
        print(f"Erro ao clicar no contato: {e}")

    # 3. Esperar e clicar no botão "Nova mensagem"
    page.wait_for_selector('button[data-original-title="Nova mensagem"]')
    page.click('button[data-original-title="Nova mensagem"]')
    page.wait_for_timeout(1000)
    
    # 4. Selecionar Caixa de Entrada e Template
    selecionar_caixa_de_entrada(page, "API Oral X")
    enviar_template(page, template_nome, parametros)

def clicar_contato_por_telefone(page, telefone):
    xpath = f'//tr[td[contains(text(), "{telefone}")]]//button[contains(@class, "primary")]'
    page.click(xpath)
    
def selecionar_caixa_de_entrada(page, texto_ou_numero):
    # 1. Clicar no dropdown para abrir a lista
    page.click('.multiselect')
    
    # 2. Esperar a lista aparecer
    page.wait_for_selector('.multiselect__option')

    # 3. Clicar na opção que contém o nome ou o telefone
    page.click(f'.multiselect__option:has-text("{texto_ou_numero}")')
    
def enviar_template(page, template_nome, parametros):
    # 1. Buscar o template pelo nome
    page.fill('input[placeholder="Buscar Modelos"]', template_nome)
    page.wait_for_selector(f'.template__list-item:has-text("{template_nome}")')
    page.click(f'.template__list-item:has-text("{template_nome}")')

    # 2. Preencher os parâmetros nos inputs encontrados
    inputs = page.locator('.template__variables-container input')
    count = inputs.count()

    for i, valor in enumerate(parametros):
        if i < count:
            inputs.nth(i).fill(valor)
        else:
            inputs.nth(i).fill(" ")

    # 3. Clicar no botão "Enviar Mensagem"
    page.click('button:has-text("Enviar Mensagem")')
    page.wait_for_timeout(2000)

def contato_existe(page, telefone):
    page.fill('input[placeholder="Pesquisar contatos"]', telefone)
    page.keyboard.press("Enter")
    page.wait_for_timeout(5000)

    # Verifica se o telefone aparece na tabela
    xpath = f'//tr[td[contains(text(), "{telefone}")]]'
    return page.locator(xpath).count() > 0

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        login_e_abrir_contatos(page)

        nome = "Bernardo Teste"
        telefone = "11999885218"
        template_name = "dentista_exame_realizado"
        template_parametros = ["Dr. João", "Bernardo", "2022-01-01"]

        if not contato_existe(page, telefone):
            print("Contato não encontrado. Criando novo contato...")
            criar_novo_contato(page, nome, telefone)
        else:
            print("Contato já existe.")

        abrir_conversa(page, telefone, nome, template_nome=template_name, parametros=template_parametros)
