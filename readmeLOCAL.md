# 🧪 Painel Oral X — Guia de Desenvolvimento Local com Docker

Este projeto utiliza React (frontend), Django (backend), PostgreSQL e Nginx, todos orquestrados via Docker. Abaixo está o passo a passo completo para testar e desenvolver localmente.

---

## ✅ Etapas de Desenvolvimento Local

### 1. Edite o código normalmente

- **Frontend React**: em `frontend/src/...`
- **Backend Django**: em `backend/apps/...`, `views.py`, `urls.py`, etc.
- **Configuração Nginx**: em `nginx/default.conf`

---

### 2. Rebuild conforme o tipo de alteração

| Tipo de alteração                     | Comando necessário                             |
|--------------------------------------|-------------------------------------------------|
| Alterações no React (JS, CSS, etc)   | `npm run build` dentro da pasta `frontend/`     |
| Alterações no Django                 | `docker-compose restart backend`               |
| Alterações no `axiosInstance.js`     | `npm run build` + rebuild do frontend           |
| Alterações no Nginx (`default.conf`) | `docker-compose restart nginx`                 |
| Mudança de `STATIC_URL`, volumes etc | `docker-compose down && docker-compose up -d --build` |

---

### 3. Comandos padrão

# Ir para o frontend e garantir que o build está atualizado
cd frontend
npm install           # se ainda não estiver feito
npm run build         # sempre que mudar algo no React
cd ..

# Rebuild forçado do frontend para garantir que o build novo seja usado
docker-compose build --no-cache frontend

# Subir todos os serviços
docker-compose up -d

---

### 4. URLs para teste local

| URL                           | Descrição                           |
| ----------------------------- | ----------------------------------- |
| `http://localhost/`           | Frontend React via Nginx            |
| `http://localhost/api/`       | API Django                          |
| `http://localhost/api/admin/` | Admin do Django (com CSS corrigido) |

---

### 5. úteis (backend Django)

# Acessar o container do backend
docker exec -it painel_backend bash

# Rodar migrações e criar superusuário
python manage.py migrate
python manage.py createsuperuser

---

### ♻️ Reset completo (caso algo bugue)

docker-compose down --volumes --remove-orphans
docker rmi painel_frontend painel_backend painel_nginx

rm -rf frontend/build
cd frontend && npm install && npm run build && cd ..

docker-compose build --no-cache
docker-compose up -d

