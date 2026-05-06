const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const appConfig = {
  redisHost: getEnv("REDIS_HOST", "localhost"),
  redisPort: Number(getEnv("REDIS_PORT", "6379")),
  redisPassword: process.env.REDIS_PASSWORD,
  queueName: getEnv("QUEUE_NAME", "ml-tasks"),
  databaseUrl: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/scheduler"),
  workerHeartbeatIntervalMs: Number(getEnv("WORKER_HEARTBEAT_INTERVAL_MS", "5000")),
  workerHeartbeatTtlMs: Number(getEnv("WORKER_HEARTBEAT_TTL_MS", "15000")),
  bullLockDurationMs: Number(getEnv("BULLMQ_LOCK_DURATION_MS", "30000")),
  taskExecutionTimeoutMs: Number(getEnv("TASK_EXECUTION_TIMEOUT_MS", "45000")),
};
