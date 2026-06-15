/**
 * Incremental migration: owner vet-contact columns (vet_clinic, vet_phone) — the
 * storage behind the "contact your vet now" escalation path. Idempotent (ADD COLUMN
 * IF NOT EXISTS), so safe to run on an already-migrated Aurora.
 *   npx tsx --env-file=.env scripts/migrate-vet-contact.ts
 */
import postgres from "postgres";

const DDL = `
ALTER TABLE owners ADD COLUMN IF NOT EXISTS vet_clinic text;
ALTER TABLE owners ADD COLUMN IF NOT EXISTS vet_phone text;
`;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const sql = postgres(url, { prepare: false });
  console.log("Adding owners.vet_clinic + owners.vet_phone …");
  await sql.unsafe(DDL);
  const [{ n }] = await sql<{ n: number }[]>`
    select count(*)::int as n from information_schema.columns
    where table_name = 'owners' and column_name in ('vet_clinic','vet_phone')`;
  console.log(`✓ Done — ${n}/2 vet-contact columns present on owners.`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
