FROM oven/bun:1
WORKDIR /app

COPY package.json ./
COPY services/scheduler/package.json services/scheduler/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install

COPY services/scheduler services/scheduler
COPY packages/shared packages/shared

WORKDIR /app/services/scheduler
CMD ["bun", "run", "src/index.ts"]
