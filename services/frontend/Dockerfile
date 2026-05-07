FROM oven/bun:1.2-slim as base
WORKDIR /app

# Install dependencies in root (monorepo)
COPY package.json bun.lock ./
COPY services/frontend/package.json ./services/frontend/
COPY services/gateway/package.json ./services/gateway/
COPY services/scheduler/package.json ./services/scheduler/
COPY services/worker/package.json ./services/worker/
COPY packages/shared/package.json ./packages/shared/

RUN bun install

# Copy source
COPY . .

# Build frontend
WORKDIR /app/services/frontend
ENV NEXT_PUBLIC_GATEWAY_URL=http://localhost:3000
ENV NEXT_PUBLIC_SCHEDULER_URL=http://localhost:3001
RUN bun run build

# Runner
FROM node:20-slim as runner
WORKDIR /app

ENV NODE_ENV production
COPY --from=base /app/services/frontend/public ./public
COPY --from=base /app/services/frontend/.next ./.next
COPY --from=base /app/services/frontend/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
