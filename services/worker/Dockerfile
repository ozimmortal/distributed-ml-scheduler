FROM python:3.11-slim

RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app
COPY package.json ./
COPY services/worker/package.json services/worker/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install

COPY services/worker services/worker
COPY packages/shared packages/shared
RUN pip install --no-cache-dir -r services/worker/requirements.txt

WORKDIR /app/services/worker
CMD ["bun", "run", "src/index.ts"]
