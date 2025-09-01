FROM node:22-alpine AS build
WORKDIR /app

ARG BUILD_VERSION
ARG BUILD_COMMIT
ENV BUILD_VERSION=$BUILD_VERSION BUILD_COMMIT=$BUILD_COMMIT

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/config/nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /usr/share/nginx/html/.well-known/appspecific

EXPOSE 80

CMD ["sh", "-c", "exec nginx -g 'daemon off;'"]