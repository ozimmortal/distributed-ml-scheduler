import { z } from "zod";
import { TASK_STATUS, WORKER_STATUS } from "./constants";

export const submitTaskSchema = z.object({
  taskType: z.enum(["iris_logreg_train", "iris_random_forest_train", "iris_model_eval"]),
  dataset: z.string().default("iris"),
  params: z.record(z.string(), z.any()).optional(),
  priority: z.number().int().min(1).max(10).default(5),
  maxAttempts: z.number().int().min(1).max(5).default(3),
});

export type SubmitTaskInput = z.infer<typeof submitTaskSchema>;
export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
export type WorkerStatus = (typeof WORKER_STATUS)[keyof typeof WORKER_STATUS];
