/**
 * Seed the reference data (scales, exercises, modifications, protocols, red flags).
 * Run after migrate, with DATABASE_URL set:  npx tsx scripts/seed.ts
 */
import { getDb } from "../lib/db/client";
import {
  scaleInstruments, exercises, modificationTypes,
  protocolTemplates, protocolPhases, redFlagRules,
} from "../lib/db/schema";
import {
  SCALE_INSTRUMENTS, EXERCISES, MODIFICATION_TYPES,
  PROTOCOL_TEMPLATES, PROTOCOL_PHASES, RED_FLAG_RULES,
} from "../lib/db/seed-data";

async function main() {
  const db = getDb();
  await db.insert(scaleInstruments).values(SCALE_INSTRUMENTS).onConflictDoNothing();
  await db.insert(exercises).values(EXERCISES).onConflictDoNothing();
  await db.insert(modificationTypes).values(MODIFICATION_TYPES).onConflictDoNothing();
  await db.insert(protocolTemplates).values(PROTOCOL_TEMPLATES).onConflictDoNothing();
  await db.insert(protocolPhases).values(PROTOCOL_PHASES);
  await db.insert(redFlagRules).values(RED_FLAG_RULES);
  console.log("✓ Seeded reference data.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
