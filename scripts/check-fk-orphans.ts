/**
 * Pre-flight for scripts/migrate-fk-sessions.ts — refuses the ADD CONSTRAINT
 * if any exercise_session_events row points at a missing pet or exercise.
 *
 *   npx tsx --env-file=.env scripts/check-fk-orphans.ts
 *
 * Exits 0 only when both orphan counts are zero. Non-mutating.
 */
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const sql = postgres(url, { prepare: false });

  const [{ orphans_pet }] = await sql<{ orphans_pet: number }[]>`
    select count(*)::int as orphans_pet
    from exercise_session_events e
    left join pets p on p.id = e.pet_id
    where p.id is null`;
  const [{ orphans_exercise }] = await sql<{ orphans_exercise: number }[]>`
    select count(*)::int as orphans_exercise
    from exercise_session_events e
    left join exercises x on x.id = e.exercise_id
    where x.id is null`;
  const [{ total }] = await sql<{ total: number }[]>`select count(*)::int as total from exercise_session_events`;

  console.log(`exercise_session_events rows total : ${total}`);
  console.log(`  orphans (no matching pet)        : ${orphans_pet}`);
  console.log(`  orphans (no matching exercise)   : ${orphans_exercise}`);

  await sql.end();
  if (orphans_pet || orphans_exercise) {
    console.error("\n✗ STOP — orphan rows exist. The ADD CONSTRAINT would fail; fix the data first.");
    process.exit(1);
  }
  console.log("\n✓ Clean — safe to run scripts/migrate-fk-sessions.ts.");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
