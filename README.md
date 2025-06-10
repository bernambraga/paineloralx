This is a Django + React project
For more info find the Readme inside the frontend folder

# Intruções para criar novo ambiente
# 1 - Clonar o GIT
git clone https://github.com/bernambraga/paineloralx
Token GIT : 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

# 2 - Criar o ambiente virtual e instalar dependências
python3 -m venv venv
source venv/bin/activate
## instalar os requirements com:
pip install -r requirements.txt
## fazer os migrations e migrate
python manage.py makemigrations
python manage.py migrate

# Build para desenvolvimento
sudo rm -rf /home/oralx/paineloralx/frontend_build/dev/*
cd frontend
sudo npm run build:dev

# Build para produção
sudo rm -rf /home/oralx/paineloralx/frontend_build/prod/*
cd frontend
sudo npm run build:prod

# 3 - Restart Gunicorn e Nginx
sudo chown -R oralx:oralx /home/oralx/paineloralx
sudo systemctl daemon-reload
sudo supervisorctl restart paineloralx_dev
sudo supervisorctl restart paineloralx
sudo systemctl restart nginx
 
# 4 Logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/supervisor/paineloralx-stdout---supervisor-3w6zn8y0.log
cat /var/log/syslog | grep -i cron
