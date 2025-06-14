configurações nginx

server {
    server_name paineloralx.com.br www.paineloralx.com.br;

    # Configuração para o backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Configuração para o admin panel do Django
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Configuração para arquivos estáticos do Django (incluindo admin)
    location /static/admin/ {
        alias /home/oralx/paineloralx/backend/static/admin/;
    }

    # Configuração para arquivos estáticos e mídia do Django
    location /backend_static/ {
        alias /home/oralx/paineloralx/backend/static/;
    }

    # Configuração para o frontend React
    location / {
        root /home/oralx/paineloralx/frontend_build/prod/;
        try_files $uri /index.html;
    }

    location /static/ {
        alias /home/oralx/paineloralx/frontend_build/prod/static/;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/paineloralx.com.br/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/paineloralx.com.br/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

server {
    if ($host = paineloralx.com.br) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name paineloralx.com.br;
    return 404; # managed by Certbot


}
