# Distributed ML Scheduler

Distributed machine-learning task scheduler built with Bun, Hono, BullMQ/Redis, and PostgreSQL/Drizzle.

## Components

- `services/gateway`: task submission and query API.
- `services/worker`: queue consumers that run lightweight Python ML jobs.
- `services/scheduler`: worker heartbeat and queue-event observability.
- `packages/shared`: shared config, queue factory, schema, and DB access.

## Quick start

1. Start all services:
   - `docker compose up --build --scale worker=3`
2. Submit tasks:
   - `curl -X POST http://localhost:3000/tasks -H "content-type: application/json" -d "{\"taskType\":\"iris_logreg_train\",\"dataset\":\"iris\"}"`
3. Run smoke test:
   - `bun scripts/smoke-test.ts`

## API

- `POST /tasks`
- `GET /tasks/:id`
- `GET /tasks/:id/result`
- `GET /workers`
- `GET /health` (gateway)
- `GET /health` (scheduler)
- `GET /health` (worker, internal)

## Failure tolerance demo

1. Run `docker compose up --build --scale worker=3`.
2. Submit a burst of tasks: `bun scripts/smoke-test.ts`.
3. Kill one worker: `docker compose kill worker`.
4. Submit tasks again; BullMQ stalled-job recovery will redeliver in-flight tasks.
5. Verify progress with:
   - `GET http://localhost:3000/tasks/:id`
   - `GET http://localhost:3000/workers`
   - `GET http://localhost:3001/events`

## Notes
- Consistency model is eventual consistency between queue lifecycle and DB state.
- Task lifecycle events are written into `task_events` for observability and auditing.
