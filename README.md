This is a Django + React project
For more info find the Readme inside the frontend folder

# Intruções para criar novo ambiente
# 1 - Clonar o GIT
git clone https://github.com/bernambraga/paineloralx
Token GIT : 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

# 2 - Criar o ambiente virtual
python3 -m venv venv

# 3 - Restart Gunicorn e Nginx
sudo systemctl daemon-reload
sudo systemctl start gunicorn_dev
sudo systemctl start gunicorn_qa
sudo systemctl start gunicorn
sudo systemctl restart nginx
 
# Build para produção
npm run build:prod
mv build/* /var/www/prod

# Build para desenvolvimento
npm run build:dev
mv build/* /var/www/dev

# Build para QA
npm run build:qa
mv build/* /var/www/qa