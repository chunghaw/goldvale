/**
 * Incremental migration: companion-chat + media tables (chat_threads, chat_messages,
 * media_assets). Idempotent — safe to run on the already-migrated Aurora.
 *   npx tsx --env-file=.env scripts/migrate-chat-media.ts
 */
import postgres from "postgres";

const DDL = `
DO $$ BEGIN CREATE TYPE chat_role  AS ENUM ('owner','assistant'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE media_kind AS ENUM ('photo','video');     EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_threads_pet_idx ON chat_threads (pet_id);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  role chat_role NOT NULL,
  text text,
  cards jsonb,
  media jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_messages_thread_idx ON chat_messages (thread_id, created_at);

CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  kind media_kind NOT NULL,
  url text NOT NULL,
  caption text,
  duration_sec int,
  journal_entry_id uuid REFERENCES journal_entries(id) ON DELETE SET NULL,
  mention_at_vet boolean NOT NULL DEFAULT false,
  embedding vector(1024),
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS media_pet_idx ON media_assets (pet_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS media_embed_idx ON media_assets USING hnsw (embedding vector_cosine_ops);
`;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const sql = postgres(url, { prepare: false });
  console.log("Applying chat + media tables …");
  await sql.unsafe(DDL);
  const [{ n }] = await sql<{ n: number }[]>`
    select count(*)::int as n from information_schema.tables
    where table_name in ('chat_threads','chat_messages','media_assets')`;
  console.log(`✓ Done — ${n}/3 tables present.`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
