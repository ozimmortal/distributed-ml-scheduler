import { Hono } from "hono";
import { submitTaskSchema } from "@scheduler/shared";
import { taskQueue } from "./queue/redis";
import { createTaskRecord, getTaskById, listWorkers } from "./lib/tasks";

const app = new Hono();

app.get("/", (c) => c.json({ service: "gateway", status: "ok" }));
app.get("/health", (c) => c.json({ service: "gateway", status: "ok" }));

app.post("/tasks", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = submitTaskSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid task payload", details: parsed.error.flatten() }, 400);
  }

  const task = await createTaskRecord(parsed.data);
  await taskQueue.add(
    "ml-task",
    { taskId: task.id, ...parsed.data },
    { attempts: parsed.data.maxAttempts, backoff: { type: "exponential", delay: 1000 } },
  );

  return c.json({ taskId: task.id, status: task.status }, 202);
});

app.get("/tasks/:id", async (c) => {
  const task = await getTaskById(c.req.param("id"));
  if (!task) {
    return c.json({ error: "Task not found" }, 404);
  }
  return c.json(task);
});

app.get("/tasks/:id/result", async (c) => {
  const task = await getTaskById(c.req.param("id"));
  if (!task) {
    return c.json({ error: "Task not found" }, 404);
  }
  if (task.status !== "COMPLETED") {
    return c.json({ error: "Task not completed", status: task.status }, 409);
  }
  return c.json({ taskId: task.id, result: task.resultJson });
});

app.get("/workers", async (c) => c.json(await listWorkers()));

export default {
  port: Number(process.env.PORT ?? 3000),
  fetch: app.fetch,
};
