import { Hono } from "hono";
import { cors } from "hono/cors";
import { lt } from "drizzle-orm";
import {
  appConfig,
  createQueueEvents,
  createTaskQueue,
  db,
  taskEvents,
  workers,
  WORKER_STATUS,
} from "@scheduler/shared";

const app = new Hono();
app.use("*", cors());
const queueEvents = createQueueEvents();
const taskQueue = createTaskQueue();

queueEvents.on("stalled", async ({ jobId }) => {
  const job = await taskQueue.getJob(jobId);
  const taskId = job?.data?.taskId as string | undefined;
  if (!taskId) {
    return;
  }
  await db.insert(taskEvents).values({
    taskId,
    fromStatus: "RUNNING",
    toStatus: "PENDING",
    eventType: "TASK_STALLED",
    metadataJson: { reason: "bullmq_stalled" },
  });
});

queueEvents.on("failed", async ({ jobId, failedReason }) => {
  const job = await taskQueue.getJob(jobId);
  const taskId = job?.data?.taskId as string | undefined;
  if (!taskId) {
    return;
  }
  await db.insert(taskEvents).values({
    taskId,
    fromStatus: "RUNNING",
    toStatus: "FAILED",
    eventType: "TASK_FAILED_QUEUE_EVENT",
    metadataJson: { failedReason },
  });
});

const monitorWorkers = async () => {
  const stale = new Date(Date.now() - appConfig.workerHeartbeatTtlMs);
  await db.update(workers).set({ status: WORKER_STATUS.UNHEALTHY }).where(lt(workers.lastHeartbeatAt, stale));
};

setInterval(monitorWorkers, appConfig.workerHeartbeatIntervalMs);

app.get("/health", (c) => c.json({ service: "scheduler", status: "ok" }));
app.get("/workers", async (c) => c.json(await db.select().from(workers)));
app.get("/events", async (c) => c.json(await db.select().from(taskEvents).limit(50)));

export default {
  port: Number(process.env.PORT ?? 3001),
  fetch: app.fetch,
};
