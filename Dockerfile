# QuickBite Multi-Stage Production Container
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm ci

# Copy source code and build assets
COPY . .
RUN npm run db:generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules

EXPOSE 5000

CMD ["node", "server/dist/server.js"]
