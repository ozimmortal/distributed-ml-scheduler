import { pgTable, text, timestamp, integer, jsonb, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskType: text("task_type").notNull(),
  payloadJson: jsonb("payload_json").notNull(),
  status: text("status").notNull(),
  priority: integer("priority").notNull().default(5),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(3),
  assignedWorkerId: text("assigned_worker_id"),
  resultJson: jsonb("result_json"),
  errorText: text("error_text"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const taskEvents = pgTable("task_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  eventType: text("event_type").notNull(),
  metadataJson: jsonb("metadata_json").default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workers = pgTable("workers", {
  workerId: text("worker_id").primaryKey(),
  hostname: text("hostname").notNull(),
  status: text("status").notNull(),
  activeJobs: integer("active_jobs").notNull().default(0),
  lastHeartbeatAt: timestamp("last_heartbeat_at").defaultNow().notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});
