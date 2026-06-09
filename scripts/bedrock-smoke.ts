/** Live Bedrock smoke: confirm Titan embeddings + Claude chat work. Throwaway. */
import { embedText, narrate } from "../lib/ai/bedrock";

async function main() {
  console.log("Region:", process.env.AWS_REGION);
  console.log("Chat model:", process.env.BEDROCK_CHAT_MODEL);
  console.log("Embed model:", process.env.BEDROCK_EMBED_MODEL);

  try {
    const v = await embedText("Oscar was slow to rise this morning.");
    console.log(`✓ EMBED ok — ${v.length} dims, first: ${v.slice(0, 3).map((n) => n.toFixed(4)).join(", ")} …`);
  } catch (e) {
    console.error("✗ EMBED failed:", (e as Error).message);
  }

  try {
    const txt = await narrate("In one short, warm sentence, greet a dog owner using a gentle tone.");
    console.log("✓ CHAT ok —", JSON.stringify(txt));
  } catch (e) {
    console.error("✗ CHAT failed:", (e as Error).message);
  }
  process.exit(0);
}
main();
