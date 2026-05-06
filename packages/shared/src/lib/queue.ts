import IORedis from "ioredis";
import { Queue, QueueEvents } from "bullmq";
import { appConfig } from "./config";

export const createRedisConnection = () =>
  new IORedis({
    host: appConfig.redisHost,
    port: appConfig.redisPort,
    password: appConfig.redisPassword,
    maxRetriesPerRequest: null,
  });

export const createTaskQueue = () =>
  new Queue(appConfig.queueName, {
    connection: createRedisConnection(),
  });

export const createQueueEvents = () =>
  new QueueEvents(appConfig.queueName, {
    connection: createRedisConnection(),
  });
