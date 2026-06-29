FROM node:20-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN addgroup -S backendGroup && adduser -S backendUser -G backendGroup

RUN chown -R backendUser:backendGroup /app

EXPOSE 3000

USER backendUser

CMD ["node", "index.js"]