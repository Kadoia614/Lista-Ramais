FROM node:22-alpine

WORKDIR /app

# Copia apenas dependências de produção
COPY package*.json ./

RUN npm install --omit=dev
RUN npm prisma:generate
RUN npm prisma:migrate

# Copia build já compilado
COPY . .

# Expõe porta
EXPOSE 3000

# Sobe aplicação
CMD ["npm", "start"]