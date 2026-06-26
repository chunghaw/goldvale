/**
 * Incremental migration: add foreign keys to exercise_session_events.
 *
 * The partitioned event table was created without REFERENCES, leaving the door
 * open to orphan rows (e.g. after a pet delete) and to silent data drift if an
 * exercise id is mistyped. PG12+ supports FK from a partitioned table to a
 * regular table, applied to every partition. Idempotent — re-running is safe.
 *
 *   npx tsx --env-file=.env scripts/migrate-fk-sessions.ts
 */
import postgres from "postgres";

const DDL = `
DO $$ BEGIN
  ALTER TABLE exercise_session_events
    ADD CONSTRAINT exercise_session_events_pet_id_fkey
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE exercise_session_events
    ADD CONSTRAINT exercise_session_events_exercise_id_fkey
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const sql = postgres(url, { prepare: false });
  console.log("Adding FK constraints to exercise_session_events …");
  await sql.unsafe(DDL);
  const rows = await sql<{ conname: string }[]>`
    select conname from pg_constraint
    where conrelid = 'exercise_session_events'::regclass and contype = 'f'
    order by conname`;
  console.log(`✓ Done — FKs on exercise_session_events: ${rows.map((r) => r.conname).join(", ") || "(none)"}.`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
