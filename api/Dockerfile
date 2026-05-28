FROM node:22-alpine

WORKDIR /app

# Copia apenas dependências de produção
COPY package*.json ./

RUN npm install --omit=dev
RUN npm run prisma:generate
RUN npm run prisma:migrate

# Copia build já compilado
COPY . .

# Expõe porta
EXPOSE 3000

# Sobe aplicação
CMD ["npm", "start"]