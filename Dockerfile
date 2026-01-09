# =========================
# 1. Build stage
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

# Для Prisma (openssl нужен всегда)
RUN apk add --no-cache openssl

# Копируем только зависимости
COPY package*.json ./

RUN npm ci

# Копируем исходники
COPY . .

# Генерация Prisma Client
RUN npx prisma generate

# Сборка NestJS
RUN npm run build


# =========================
# 2. Production stage
# =========================
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

# Копируем только нужное
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/generated ./generated

EXPOSE 3000

# Миграции + запуск
CMD ["sh", "-c", "node dist/main.js"]
