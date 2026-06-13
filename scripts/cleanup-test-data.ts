/**
 * Remove test-artifact rows from Oscar's record. The agent smoke tests (check-companion*)
 * called tools that write to the journal — those land at the REAL current time, outside
 * the demo timeline (NOW = 2026-06-09). Delete anything recorded after the demo window.
 *   npx tsx --env-file=.env scripts/cleanup-test-data.ts
 */
import { and, eq, gt } from "drizzle-orm";
import { getDb } from "../lib/db/client";
import { journalEntries, exerciseSessionEvents, medicationEvents, dailyCheckins, mediaAssets } from "../lib/db/schema";
import { OSCAR_PET_ID } from "../lib/data/ids";

const CUTOFF = new Date("2026-06-10T00:00:00Z"); // demo timeline ends Jun 9

async function main() {
  const db = getDb();
  const tables = [
    { name: "journal_entries", t: journalEntries, col: journalEntries.recordedAt, pet: journalEntries.petId },
    { name: "exercise_session_events", t: exerciseSessionEvents, col: exerciseSessionEvents.recordedAt, pet: exerciseSessionEvents.petId },
    { name: "medication_events", t: medicationEvents, col: medicationEvents.recordedAt, pet: medicationEvents.petId },
    { name: "daily_checkins", t: dailyCheckins, col: dailyCheckins.recordedAt, pet: dailyCheckins.petId },
    { name: "media_assets", t: mediaAssets, col: mediaAssets.recordedAt, pet: mediaAssets.petId },
  ];
  for (const { name, t, col, pet } of tables) {
    const del = await db.delete(t).where(and(eq(pet, OSCAR_PET_ID), gt(col, CUTOFF))).returning({ id: t.id });
    if (del.length) console.log(`  ${name}: removed ${del.length} test row(s)`);
  }
  const j = await db.select().from(journalEntries).where(eq(journalEntries.petId, OSCAR_PET_ID));
  console.log(`✓ journal now ${j.length} entries:`);
  j.sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
    .forEach((e) => console.log(`   ${e.recordedAt.toISOString().slice(0, 10)}  ${e.text.slice(0, 56)}`));
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
