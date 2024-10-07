FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# Crie um script de inicialização
COPY start.sh .

# Torne o script executável
RUN chmod +x start.sh

EXPOSE 8080

# Execute o script de inicialização
CMD ["./start.sh"]
