FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

COPY server.js package.json ./

RUN npm install --production

EXPOSE 3000

CMD ["node", "server.js"]
