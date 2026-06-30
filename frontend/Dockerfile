# ===== build =====

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm ci

COPY vite.config.ts tsconfig.node.json tsconfig.app.json tsconfig.json ./

COPY src ./src

COPY public ./public

COPY index.html ./

RUN npm run build

# ===== run =====

FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

