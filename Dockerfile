FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY src ./src
COPY openapi.yaml ./

RUN npm run build

RUN npm prune --omit=dev

FROM node:22-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=8081

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/openapi.yaml ./

RUN addgroup -g 10014 choreo && \
    adduser --disabled-password --no-create-home --uid 10014 --ingroup choreo choreouser

USER 10014
EXPOSE 8081

CMD ["node", "dist/main.js"]
