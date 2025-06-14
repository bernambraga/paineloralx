# Etapa 1: build
FROM node:20-alpine as build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Etapa 2: servir o build com Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
