FROM node:22-alpine

WORKDIR /app

COPY package*.json .

RUN npm ci --omit=dev

COPY . .

RUN addgroup -S backendGroup && adduser -S backendUser -G backendGroup

RUN chown -R backendUser:backendGroup /app

EXPOSE 3000

USER backendUser

CMD ["node", "index.js"]