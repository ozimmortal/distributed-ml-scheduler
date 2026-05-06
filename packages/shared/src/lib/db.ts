import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { appConfig } from "./config";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: appConfig.databaseUrl,
});

export const db = drizzle(pool, { schema });
