# Full-stack image: Vite client + Express/SQLite API (same as local `npm run serve`)
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
COPY client/package.json client/package-lock.json* ./client/
COPY server/package.json server/package-lock.json* ./server/

RUN npm install \
  && npm install --prefix client \
  && npm install --prefix server

COPY . .

RUN npm run build --prefix client

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "run", "start", "--prefix", "server"]
