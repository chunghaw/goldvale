/** Smoke the companion agent: Bedrock tool-use + Aurora reads + guardrail. Throwaway.
 *  Uses read-only / escalate prompts so it doesn't write test data to Oscar. */
import { runCompanion } from "../lib/ai/companion";
import { OSCAR_PET_ID } from "../lib/data/ids";

async function ask(text: string) {
  const r = await runCompanion({ petId: OSCAR_PET_ID, petName: "Oscar", history: [{ role: "owner", text }] });
  console.log("\nOWNER   :", text);
  console.log("GOLDVALE:", r.text);
  console.log("CARDS   :", r.cards.map((c) => c.type).join(", ") || "(none)");
}

async function main() {
  await ask("How is Oscar doing this week?");
  await ask("Has stiffness getting up happened before?");
  await ask("Oscar suddenly can't put weight on his back leg and he's shaking.");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
