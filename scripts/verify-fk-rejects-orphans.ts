/**
 * Confirms the FK constraints just added to exercise_session_events actually
 * reject orphan inserts. Throws if either insert succeeds. Non-mutating: the
 * inserts are wrapped in a savepoint that always rolls back.
 *
 *   npx tsx --env-file=.env scripts/verify-fk-rejects-orphans.ts
 */
import postgres from "postgres";

const FAKE_PET = "00000000-0000-4000-8000-000000000bad";
const FAKE_EX = "__nonexistent_exercise__";
const REAL_PET = "a0c5ca9e-0000-4000-8000-000000000001"; // OSCAR_PET_ID

async function expectRejection(sql: postgres.Sql, label: string, run: () => Promise<unknown>) {
  let threw = false;
  try {
    await sql.begin(async (tx) => {
      await run.call(tx);
      throw new Error("__rollback__"); // never persist
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    threw = !/__rollback__/.test(msg);
    if (threw) console.log(`  ✓ ${label}: rejected — ${msg.split("\n")[0]}`);
    else console.log(`  ✗ ${label}: insert SUCCEEDED — FK is not enforcing!`);
  }
  return threw;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const sql = postgres(url, { prepare: false });
  console.log("Confirming the new FKs reject orphan inserts (non-mutating):");

  const orphanPet = await expectRejection(sql, "pet_id orphan", async function (this: postgres.TransactionSql) {
    await this`
      insert into exercise_session_events (pet_id, exercise_id, recorded_at)
      values (${FAKE_PET}::uuid, 'sit_to_stand', now())`;
  });
  const orphanEx = await expectRejection(sql, "exercise_id orphan", async function (this: postgres.TransactionSql) {
    await this`
      insert into exercise_session_events (pet_id, exercise_id, recorded_at)
      values (${REAL_PET}::uuid, ${FAKE_EX}, now())`;
  });

  await sql.end();
  if (!orphanPet || !orphanEx) {
    console.error("\n✗ FAIL — FK enforcement gap");
    process.exit(1);
  }
  console.log("\n✓ PASS — both FKs reject orphan inserts.");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
