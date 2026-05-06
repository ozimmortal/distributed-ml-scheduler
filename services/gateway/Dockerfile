FROM oven/bun:1
WORKDIR /app

COPY package.json ./
COPY services/gateway/package.json services/gateway/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install

COPY services/gateway services/gateway
COPY packages/shared packages/shared

WORKDIR /app/services/gateway
CMD ["bun", "run", "src/index.ts"]
