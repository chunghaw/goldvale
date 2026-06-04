import { defineConfig } from "drizzle-kit";

// db/schema.sql is the canonical DDL (partitioning, HNSW, materialized views).
// This config is for drizzle-kit introspection / studio against the typed schema.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./db/drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
