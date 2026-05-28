FROM node:22-alpine

WORKDIR /app

# Copia apenas dependências de produção
COPY package*.json ./

RUN npm install --omit=dev

# Copia build já compilado
COPY . .

RUN npm run prisma:generate

# Expõe porta
EXPOSE 3000

# Sobe aplicação
CMD ["sh", "-c", "npm run prisma:migrate && npm start"]
