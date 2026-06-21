# ===== build =====

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

COPY vite.config.ts tsconfig.node.json tsconfig.app.json tsconfig.json ./

COPY src ./src

COPY public ./public

COPY index.html ./

RUN npm run build

# ===== run =====

FROM nginxinc/nginx-unprivileged:alpine

WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD [ "nginx", "-g", "daemon off;"]

