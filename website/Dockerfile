# syntax=docker/dockerfile:1.7
# Multi-stage production image: builds the website and API, ships only what runs.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci --ignore-scripts && npm rebuild esbuild sharp
COPY shared shared
COPY client client
COPY server server
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=4000 CLIENT_DIST=/app/client/dist UPLOAD_DIR=/app/uploads
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci --omit=dev --workspace server --ignore-scripts && npm rebuild sharp && npm cache clean --force
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/client/dist client/dist
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1
CMD ["node", "server/dist/index.js"]
