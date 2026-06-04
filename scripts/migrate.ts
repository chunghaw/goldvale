/**
 * Apply db/schema.sql (the canonical DDL — partitioning, HNSW, materialized views)
 * to DATABASE_URL. Run once on a fresh Aurora database:  npx tsx scripts/migrate.ts
 *
 * Not idempotent (CREATE TYPE/TABLE are not IF NOT EXISTS) — intended for initial setup.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const sql = postgres(url, { prepare: false });
  const ddl = readFileSync(resolve(process.cwd(), "db/schema.sql"), "utf8");
  console.log("Applying db/schema.sql to Aurora …");
  await sql.unsafe(ddl);
  console.log("✓ Schema applied.");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
