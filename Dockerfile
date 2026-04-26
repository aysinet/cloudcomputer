# ── Build stage ──
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

# ── Runtime stage ──
FROM node:20-alpine

RUN apk add --no-cache 7zip

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

ENV IS_DOCKER=true
ENV INSTANCE_ID=default
ENV DOCKER_MANAGER_URL=http://docker-manager:9800

EXPOSE 8080

CMD ["node", "desktop.js"]
