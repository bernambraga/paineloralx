This is a Django + React project
For more info find the Readme inside the frontend folder

#Subir site ok
###Usar dominio ok
#####Login? mais ou menos
##Log do SAC não fiz
#Automatizar robo SAC com teste 

sudo systemctl daemon-reload
sudo systemctl start gunicorn_dev
sudo systemctl start gunicorn_qa
sudo systemctl start gunicorn
sudo systemctl restart nginx
 
# Build para produção
npm run build:prod
mv build ../build_prod

# Build para desenvolvimento
npm run build:dev
mv build ../build_dev

# Build para QA
npm run build:qa
mv build ../build_qa