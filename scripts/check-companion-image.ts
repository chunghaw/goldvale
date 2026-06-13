/** Smoke the multimodal path: the agent sees a photo and replies non-clinically. Throwaway. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runCompanion } from "../lib/ai/companion";
import { OSCAR_PET_ID } from "../lib/data/ids";

async function main() {
  const b64 = readFileSync(resolve(process.cwd(), "handoff/companion/assets/incision-demo.jpg")).toString("base64");
  const r = await runCompanion({
    petId: OSCAR_PET_ID, petName: "Oscar",
    history: [{ role: "owner", text: "Here's the incision from this morning." }],
    image: { base64: b64, mediaType: "image/jpeg" },
  });
  console.log("GOLDVALE:", r.text);
  console.log("CARDS   :", r.cards.map((c) => c.type).join(", ") || "(none)");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
