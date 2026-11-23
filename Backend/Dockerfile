FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN NODE_OPTIONS="--dns-result-order=ipv4first" npm ci --omit=dev --maxsockets=3 --fetch-timeout=600000 --fetch-retries=5

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]