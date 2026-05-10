# ── Build stage ──
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ \
    pkgconf cairo-dev pango-dev pixman-dev jpeg-dev giflib-dev librsvg-dev

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

# ── Runtime stage ──
FROM node:20-alpine

RUN apk add --no-cache 7zip curl \
    cairo pango pixman jpeg giflib librsvg \
    && ARCH=$(uname -m) \
    && if [ "$ARCH" = "x86_64" ]; then GOARCH=amd64; \
       elif [ "$ARCH" = "aarch64" ]; then GOARCH=arm64; \
       else GOARCH=amd64; fi \
    && curl -fsSL "https://github.com/tdewolff/minify/releases/latest/download/minify_linux_${GOARCH}.tar.gz" \
       | tar -xz -C /usr/local/bin minify \
    && chmod +x /usr/local/bin/minify

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Keep a copy of default config outside the data volume
RUN cp desktop.config.json desktop.config.default.json

ENV IS_DOCKER=true
ENV INSTANCE_ID=default
ENV DOCKER_MANAGER_URL=http://docker-manager:9800
ENV OLLAMA_URL=http://cloudpc-ollama:11434

EXPOSE 8080

CMD ["node", "desktop.js"]
