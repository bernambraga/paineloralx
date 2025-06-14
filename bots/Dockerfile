# Dockerfile (na pasta ./bots)

FROM python:3.11-slim

# Instala dependências básicas + playwright + supercronic
RUN apt-get update && apt-get install -y wget curl unzip bash cron
RUN wget -O /usr/local/bin/supercronic https://github.com/aptible/supercronic/releases/latest/download/supercronic-linux-amd64 && \
    chmod +x /usr/local/bin/supercronic
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
RUN playwright install chromium --with-deps

# Cria diretórios padrão
WORKDIR /app
COPY . /app

# Copia o cron customizado
COPY crontab.txt /etc/cron.d/bots-cron

# Entrypoint com o supercronic
CMD ["supercronic", "/etc/cron.d/bots-cron"]
