#!/bin/sh

# Aplica as migrações do Prisma
npx prisma migrate deploy

# Inicia a aplicação
npm run start:prod
