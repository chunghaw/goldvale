/**
 * Reset Oscar's companion chat thread so a judge starts the demo from an empty
 * conversation. Non-destructive elsewhere — only deletes the demo pet's rows.
 *
 *   npx tsx --env-file=.env scripts/reset-demo-thread.ts
 */
import postgres from "postgres";
import { OSCAR_PET_ID } from "../lib/data/ids";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const sql = postgres(url, { prepare: false });

  const before = await sql<{ id: string }[]>`
    select id from chat_threads where pet_id = ${OSCAR_PET_ID}`;
  console.log(`Threads before: ${before.length}`);

  const del = await sql`delete from chat_threads where pet_id = ${OSCAR_PET_ID}`;
  console.log(`Deleted: ${del.count} thread(s) (chat_messages cascade)`);

  const [{ n }] = await sql<{ n: number }[]>`
    select count(*)::int as n from chat_threads where pet_id = ${OSCAR_PET_ID}`;
  console.log(`Threads after: ${n}`);

  await sql.end();
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
