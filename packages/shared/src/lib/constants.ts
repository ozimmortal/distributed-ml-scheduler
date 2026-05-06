export const TASK_QUEUE_NAME = "ml-tasks";

export const TASK_STATUS = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export const WORKER_STATUS = {
  ONLINE: "ONLINE",
  UNHEALTHY: "UNHEALTHY",
  OFFLINE: "OFFLINE",
} as const;
