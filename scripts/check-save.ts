/**
 * Verify the check-in write path actually persists to Aurora, then clean up after
 * itself so Oscar's seed is untouched. Throwaway dev check.
 *   npx tsx --env-file=.env scripts/check-save.ts
 */
import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "../lib/db/client";
import { dailyCheckins, exerciseSessionEvents, medicationEvents, journalEntries } from "../lib/db/schema";
import { persistCheckin } from "../lib/data/checkin-write";
import { OSCAR_PET_ID } from "../lib/data/ids";

const MARK = "__TEST__ verifying save path";

async function counts() {
  const db = getDb();
  const [row] = await db.execute<{ checkins: number; sessions: number; meds: number; journals: number }>(
    sql`select
      (select count(*) from daily_checkins where pet_id = ${OSCAR_PET_ID})        as checkins,
      (select count(*) from exercise_session_events where pet_id = ${OSCAR_PET_ID}) as sessions,
      (select count(*) from medication_events where pet_id = ${OSCAR_PET_ID})       as meds,
      (select count(*) from journal_entries where pet_id = ${OSCAR_PET_ID})         as journals`,
  );
  return { checkins: Number(row.checkins), sessions: Number(row.sessions), meds: Number(row.meds), journals: Number(row.journals) };
}

async function main() {
  const db = getDb();
  const before = await counts();
  const start = new Date();

  const id = await persistCheckin({
    petId: OSCAR_PET_ID,
    qol: 3,
    mobilityItems: { rising: 1, stairs: 0 },
    exercises: [{ exerciseId: "sit_to_stand", tolerance: "handled" }],
    meds: [{ medName: "Carprofen", given: true }],
    note: MARK,
  });
  console.log("Inserted check-in:", id);

  const after = await counts();
  const ok =
    after.checkins === before.checkins + 1 &&
    after.sessions === before.sessions + 1 &&
    after.meds === before.meds + 1 &&
    after.journals === before.journals + 1;
  console.log("before:", before);
  console.log("after :", after);

  // cleanup — remove exactly what this test wrote
  await db.delete(journalEntries).where(and(eq(journalEntries.petId, OSCAR_PET_ID), eq(journalEntries.text, MARK)));
  await db.delete(exerciseSessionEvents).where(and(eq(exerciseSessionEvents.petId, OSCAR_PET_ID), gte(exerciseSessionEvents.recordedAt, start)));
  await db.delete(medicationEvents).where(and(eq(medicationEvents.petId, OSCAR_PET_ID), gte(medicationEvents.recordedAt, start)));
  await db.delete(dailyCheckins).where(and(eq(dailyCheckins.petId, OSCAR_PET_ID), eq(dailyCheckins.note, MARK)));

  const restored = await counts();
  const clean = restored.checkins === before.checkins && restored.journals === before.journals;
  console.log("cleaned:", restored);
  console.log(ok && clean ? "\n✓ SAVE round-trip OK (and cleaned up)" : "\n✗ SAVE check FAILED");
  process.exit(ok && clean ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
