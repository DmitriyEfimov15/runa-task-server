# =========================
# 1. Build stage
# =========================
FROM node:22-alpine AS builder

WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

# Явно копируем всю папку prisma
COPY prisma ./prisma
COPY . .

ARG DATABASE_URL
ARG SHADOW_DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ENV SHADOW_DATABASE_URL=${SHADOW_DATABASE_URL}

RUN npx prisma generate
RUN npm run build

# =========================
# 2. Production stage
# =========================
FROM node:22-alpine

WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
