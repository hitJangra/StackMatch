FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --fetch-timeout=600000 --fetch-retries=5

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]