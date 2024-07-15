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
sudo supervisorctl restart dev_paineloralx
sudo supervisorctl restart paineloralx
sudo systemctl restart nginx


# Build para produção
sudo rm -rf /home/oralx/paineloralx/frontend_build/prod/*
sudo npm run build:prod

# Build para desenvolvimento
sudo rm -rf /home/oralx/paineloralx/frontend_build/dev/*
sudo npm run build:dev
