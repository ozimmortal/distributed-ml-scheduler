import { eq, desc, sql } from "drizzle-orm";
import { db, taskEvents, tasks, workers } from "@scheduler/shared";
import type { SubmitTaskInput } from "@scheduler/shared";
import { TASK_STATUS } from "@scheduler/shared";

export const createTaskRecord = async (input: SubmitTaskInput) => {
  const [created] = await db
    .insert(tasks)
    .values({
      taskType: input.taskType,
      payloadJson: input,
      status: TASK_STATUS.PENDING,
      priority: input.priority,
      maxAttempts: input.maxAttempts,
    })
    .returning();

  await db.insert(taskEvents).values({
    taskId: created.id,
    fromStatus: null,
    toStatus: TASK_STATUS.PENDING,
    eventType: "TASK_CREATED",
    metadataJson: {},
  });

  return created;
};

export const getTaskById = async (id: string) => {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
  return task;
};

export const listWorkers = async () => db.select().from(workers);

export const listTasks = async (limit = 20) => {
  return db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(limit);
};
