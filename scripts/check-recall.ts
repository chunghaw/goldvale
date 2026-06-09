/** Verify pgvector semantic recall ranks the right journal days. Throwaway. */
import { recallSimilarJournal } from "../lib/data/queries";
import { OSCAR_PET_ID } from "../lib/data/ids";

async function main() {
  const q = "stiff and slow getting up off the floor this morning";
  console.log("Query:", JSON.stringify(q), "\n");
  const hits = await recallSimilarJournal(OSCAR_PET_ID, q, 4);
  for (const h of hits) {
    console.log(`${(h.similarity * 100).toFixed(1)}%  ${h.date}  ${JSON.stringify(h.text)}`);
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
