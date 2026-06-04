import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set (add it to .env)");
  return drizzle(postgres(url, { prepare: false }), { schema });
}

let _db: ReturnType<typeof createDb> | null = null;

/** Lazy singleton Aurora client (no connection is opened until first use). */
export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

export { schema };
