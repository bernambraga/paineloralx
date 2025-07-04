import requests

# CONFIGURAÇÕES
TOKEN = "EAARhQfYzhnUBO53xZC96RZC1P7rN3rZCrHuRz1bZCFRY6RePYHcctcIEncFKREPZAK66jCd734IWA59mFB5q5ZBhfml6EPCUJTmEIftRgflY2FdK6i1gc8oE6kaaJv26NqMxwdn9yIllECJ137ejvWa7JfJrfK2SF0GpvYkkFkZBfL1LcZAxt4ZAdcZBYZA2eddzwtmJQZDZD"
APP_ID = "1232835838183029"
APP_SECRET = "ac6776d4245585dbfe5b98c12223c1ac"
RECIPIENT = "5511999885218"
PHONE_NUMBER_ID = "595317807009273"
TEMPLATE_NAME = "dentista_exame_realizado"
LANGUAGE = "pt_BR"

def verificar_token_e_enviar_template():
    # Gerar APP_TOKEN para verificação
    app_token = f"{APP_ID}|{APP_SECRET}"
    
    # 1. VERIFICAR TOKEN
    url_debug = "https://graph.facebook.com/debug_token"
    params = {
        "input_token": TOKEN,
        "access_token": app_token
    }
    resp = requests.get(url_debug, params=params)
    dados = resp.json()

    # 2. Analisar resposta
    if "data" in dados and dados["data"].get("is_valid"):
        print("✅ Token válido. Prosseguindo com envio...")

        # 3. Enviar template
        url_envio = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"
        headers = {
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "messaging_product": "whatsapp",
            "to": RECIPIENT,
            "type": "template",
            "template": {
                "name": TEMPLATE_NAME,
                "language": { "code": LANGUAGE },
                "components" : [
                    {
                        "type": "body",
                        "parameters": [
                            { "type": "text", "text": "Bernardo" },
                            { "type": "text", "text": "João" },
                            { "type": "text", "text": "Tomografia" }
                        ]
                    }
                ]
            }
        }
        resp_envio = requests.post(url_envio, headers=headers, json=payload)
        print("Status do envio:", resp_envio.status_code)
        print("Resposta:", resp_envio.json())

    else:
        print("❌ Token inválido ou expirado.")
        if "error" in dados:
            print("Erro:", dados["error"].get("message"))
        elif "data" in dados:
            print("Motivo:", dados["data"].get("error", "Desconhecido"))

if __name__ == "__main__":
    try:
        verificar_token_e_enviar_template()
    except Exception as e:
        print("Erro:", str(e))