FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

COPY . .

RUN groupadd -r backendGroup && useradd -r -g backendGroup -d /app -s /sbin/nologin backendUser && chown -R backendUser:backendGroup /app

EXPOSE 3000

USER backendUser

CMD ["node", "index.js"]