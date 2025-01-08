from PIL import Image, ImageDraw, ImageFont
import base64
from io import BytesIO
from datetime import datetime

def gerar_imagem_base64(tipo, numero, unidade):
    largura, altura = 384, 500
    img = Image.new('RGB', (largura, altura), color='white')
    draw = ImageDraw.Draw(img)

    # Fontes
    fonte_grande = ImageFont.truetype("arial.ttf", 102)
    fonte_media = ImageFont.truetype("arial.ttf", 50)
    fonte_pequena = ImageFont.truetype("arial.ttf", 36)

    # Formatar o tipo para pegar somente a primeira letra maiúscula e o número com dois dígitos
    tipo_formatado = tipo[0].upper()
    numero_formatado = f"{numero:02}"  # Garante que o número tenha dois dígitos (ex: 01, 02, ..., 09)

    # Adiciona os textos
    draw.text((largura // 2, 50), "Senha:", font=fonte_media, fill="black", anchor="mm")
    draw.text((largura // 2, 150), f"{tipo_formatado}-{numero_formatado}", font=fonte_grande, fill="black", anchor="mm")
    draw.text((largura // 2, 250), unidade, font=fonte_pequena, fill="black", anchor="mm")
    draw.text((largura // 2, 350), datetime.now().strftime("%d/%m/%Y"), font=fonte_pequena, fill="black", anchor="mm")
    draw.text((largura // 2, 400), datetime.now().strftime("%H:%M:%S"), font=fonte_pequena, fill="black", anchor="mm")

    # Converte para Base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

    return img_base64
