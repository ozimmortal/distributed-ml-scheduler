import { Worker } from "bullmq";
import { spawn } from "bun";
import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import {
  appConfig,
  createRedisConnection,
  db,
  taskEvents,
  tasks,
  WORKER_STATUS,
  workers,
  TASK_STATUS,
} from "@scheduler/shared";

const workerId = process.env.WORKER_ID ?? `${process.env.HOSTNAME ?? "worker"}-${Math.random().toString(36).slice(2, 7)}`;
const hostname = process.env.HOSTNAME ?? "unknown-host";

const heartbeat = async () => {
  await db
    .insert(workers)
    .values({
      workerId,
      hostname,
      status: WORKER_STATUS.ONLINE,
      activeJobs: 0,
    })
    .onConflictDoUpdate({
      target: workers.workerId,
      set: {
        status: WORKER_STATUS.ONLINE,
        lastHeartbeatAt: new Date(),
      },
    });
};

const runPythonTask = async (taskType: string, payload: unknown) => {
  const child = spawn({
    cmd: ["python", "ml/run_task.py", taskType, JSON.stringify(payload)],
    cwd: process.cwd(),
    stdout: "pipe",
    stderr: "pipe",
  });

  const timeout = setTimeout(() => {
    child.kill();
  }, appConfig.taskExecutionTimeoutMs);

  const [stdoutBuffer, stderrBuffer, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  clearTimeout(timeout);

  if (exitCode !== 0) {
    throw new Error(stderrBuffer || `Python runner failed with exit code ${exitCode}`);
  }

  return JSON.parse(stdoutBuffer);
};

await heartbeat();
setInterval(heartbeat, appConfig.workerHeartbeatIntervalMs);

const taskWorker = new Worker(
  appConfig.queueName,
  async (job) => {
    const { taskId, taskType, ...payload } = job.data as { taskId: string; taskType: string };

    await db
      .update(tasks)
      .set({
        status: TASK_STATUS.RUNNING,
        startedAt: new Date(),
        assignedWorkerId: workerId,
        attempts: job.attemptsStarted,
      })
      .where(eq(tasks.id, taskId));
    await db.insert(taskEvents).values({
      taskId,
      fromStatus: TASK_STATUS.PENDING,
      toStatus: TASK_STATUS.RUNNING,
      eventType: "TASK_STARTED",
      metadataJson: { workerId, jobId: job.id },
    });

    const result = await runPythonTask(taskType, payload);

    await db
      .update(tasks)
      .set({
        status: TASK_STATUS.COMPLETED,
        resultJson: result,
        completedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.status, TASK_STATUS.RUNNING)));
    await db.insert(taskEvents).values({
      taskId,
      fromStatus: TASK_STATUS.RUNNING,
      toStatus: TASK_STATUS.COMPLETED,
      eventType: "TASK_COMPLETED",
      metadataJson: { workerId, jobId: job.id },
    });
    return result;
  },
  {
    connection: createRedisConnection(),
    lockDuration: appConfig.bullLockDurationMs,
    stalledInterval: 5000,
    concurrency: Number(process.env.WORKER_CONCURRENCY ?? 2),
  },
);

taskWorker.on("failed", async (job, error) => {
  if (!job?.data?.taskId) {
    return;
  }
  await db
    .update(tasks)
    .set({
      status: TASK_STATUS.FAILED,
      errorText: error.message,
      completedAt: new Date(),
    })
    .where(eq(tasks.id, job.data.taskId));
  await db.insert(taskEvents).values({
    taskId: job.data.taskId,
    fromStatus: TASK_STATUS.RUNNING,
    toStatus: TASK_STATUS.FAILED,
    eventType: "TASK_FAILED",
    metadataJson: { workerId, jobId: job.id, error: error.message },
  });
});

console.log(`[worker] started workerId=${workerId}`);

const app = new Hono();
app.get("/health", (c) => c.json({ service: "worker", status: "ok", workerId }));

export default {
  port: Number(process.env.PORT ?? 4000),
  fetch: app.fetch,
};
