/** Create a persistent fresh pet (no cleanup) to screenshot its empty-state screens.
 *  Delete afterward with scripts/del-pet.ts <id>. Throwaway. */
import { createPetFromOnboarding } from "../lib/data/onboarding-write";

async function main() {
  const id = await createPetFromOnboarding({
    name: "Luna", species: "cat", breed: "Domestic shorthair", age: "11 yr", senior: true,
    conditions: ["osteoarthritis"], template: null, onsetDate: "",
    hasPlan: "no", prescriber: "", exercises: [], meds: [{ name: "Meloxicam 0.5 mg", timing: "Morning" }],
  });
  console.log("NEWPET_ID=" + id);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
