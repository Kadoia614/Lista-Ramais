FROM node:lts-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --silent

ARG VITE_APP_NODE_ENV
ARG VITE_API_BASE_URL
ENV VITE_APP_NODE_ENV=$VITE_APP_NODE_ENV
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/app_prefeitura
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]