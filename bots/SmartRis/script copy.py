from playwright.sync_api import sync_playwright
from lxml import html

def buscar_xpath_por_texto_ou_atributo(page_html, termo="download"):
    tree = html.fromstring(page_html)
    termo_lower = termo.lower()

    # XPath com múltiplas condições: texto OU atributos
    elementos = tree.xpath(
        f"""//*[
            contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{termo_lower}')
            or contains(translate(@id, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{termo_lower}')
            or contains(translate(@class, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{termo_lower}')
            or contains(translate(@aria-label, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{termo_lower}')
            or contains(translate(@title, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{termo_lower}')
            or contains(translate(@alt, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{termo_lower}')
            or contains(translate(@href, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{termo_lower}')
        ]"""
    )

    xpaths = []
    for el in elementos:
        if el.tag in ['a', 'button', 'span', 'div', 'i', 'svg']:
            try:
                xpath = tree.getpath(el)
                xpaths.append(xpath)
            except Exception:
                continue
    return xpaths

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto("https://oralx.smartris.com.br/")  # substitua pela URL real

    page.wait_for_load_state("networkidle")
    html_content = page.content()

    xpaths_encontrados = buscar_xpath_por_texto_ou_atributo(html_content, "login")

    print("XPaths encontrados:")
    for xpath in xpaths_encontrados:
        print(xpath)

    browser.close()
