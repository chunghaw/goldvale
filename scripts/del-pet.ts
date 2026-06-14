/** Delete a pet (and its owner → cascade) by pet id. Also clears partitioned sessions. Throwaway.
 *  npx tsx --env-file=.env scripts/del-pet.ts <petId> */
import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/client";
import { owners, pets, exerciseSessionEvents } from "../lib/db/schema";

async function main() {
  const id = process.argv[2];
  if (!id) throw new Error("usage: del-pet.ts <petId>");
  const db = getDb();
  const [pet] = await db.select().from(pets).where(eq(pets.id, id)).limit(1);
  if (!pet) { console.log("no such pet"); process.exit(0); }
  await db.delete(exerciseSessionEvents).where(eq(exerciseSessionEvents.petId, id));
  await db.delete(owners).where(eq(owners.id, pet.ownerId));
  console.log("✓ deleted pet", id, "and owner", pet.ownerId);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
