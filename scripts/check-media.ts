/** Verify the media timeline + pgvector "similar days" visual recall. Throwaway. */
import { getMediaTimeline, getSimilarMedia } from "../lib/data/media";
import { OSCAR_PET_ID } from "../lib/data/ids";

async function main() {
  const t = await getMediaTimeline(OSCAR_PET_ID);
  console.log(`TIMELINE: ${t.photoCount} photos · ${t.videoCount} clips · ${t.flaggedCount} flagged`);
  console.log("ITEMS   :", t.items.map((i) => `${i.group}/${i.dateLabel} ${i.kind} "${i.caption}"`).join("\n          "));

  const seed = t.items.find((i) => i.caption?.includes("today") && i.recallable) ?? t.items.find((i) => i.recallable);
  if (!seed) throw new Error("no recallable photo");
  console.log(`\nSIMILAR DAYS to "${seed.caption}":`);
  const sim = await getSimilarMedia(OSCAR_PET_ID, seed.id, 8);
  sim.forEach((s) => console.log(`  ${(s.similarity * 100).toFixed(1)}%  ${s.dateLabel}  ${s.caption}`));
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
