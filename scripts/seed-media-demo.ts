/**
 * Seed Oscar's media library from the design placeholders — uploads to S3, embeds
 * photos with Titan, inserts media_assets. The 6-photo incision series (over 6 weeks)
 * powers the pgvector "similar days" visual recall. Re-runnable. Also smoke-tests the
 * whole media foundation (S3 + Titan + DB).
 *   npx tsx --env-file=.env scripts/seed-media-demo.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/client";
import { mediaAssets } from "../lib/db/schema";
import { saveMedia } from "../lib/data/media-write";
import { OSCAR_PET_ID } from "../lib/data/ids";

const NOW = new Date("2026-06-09T09:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
const dataUrl = (file: string) => {
  const b = readFileSync(resolve(process.cwd(), "handoff/media/assets", file));
  return `data:image/jpeg;base64,${b.toString("base64")}`;
};

interface Item { file: string; kind: "photo" | "video"; caption: string; daysAgo: number; durationSec?: number }

const ITEMS: Item[] = [
  { file: "media-incision-1.jpg", kind: "photo", caption: "Incision — left knee (week 1)", daysAgo: 35 },
  { file: "media-incision-2.jpg", kind: "photo", caption: "Incision — left knee (week 2)", daysAgo: 28 },
  { file: "media-incision-3.jpg", kind: "photo", caption: "Incision — left knee (week 3)", daysAgo: 21 },
  { file: "media-incision-4.jpg", kind: "photo", caption: "Incision — left knee (week 4)", daysAgo: 14 },
  { file: "media-incision-5.jpg", kind: "photo", caption: "Incision — left knee (week 5)", daysAgo: 7 },
  { file: "media-incision-6.jpg", kind: "photo", caption: "Incision — left knee (today)", daysAgo: 0 },
  { file: "media-walk.jpg", kind: "photo", caption: "Morning walk", daysAgo: 3 },
  { file: "media-rest.jpg", kind: "photo", caption: "Resting comfortably", daysAgo: 1 },
  { file: "media-clip-garden.jpg", kind: "video", caption: "Pottering in the garden", daysAgo: 5, durationSec: 12 },
  { file: "media-clip-stairs.jpg", kind: "video", caption: "Stairs — short clip", daysAgo: 2, durationSec: 9 },
];

async function main() {
  const db = getDb();
  await db.delete(mediaAssets).where(eq(mediaAssets.petId, OSCAR_PET_ID));

  for (const it of ITEMS) {
    await saveMedia({
      petId: OSCAR_PET_ID, kind: it.kind, dataUrl: dataUrl(it.file), caption: it.caption,
      durationSec: it.durationSec, recordedAt: new Date(NOW.getTime() - it.daysAgo * DAY),
      mentionAtVet: it.file === "media-incision-6.jpg",
    });
    console.log(`  uploaded ${it.file} (${it.kind})`);
  }
  console.log(`✓ Seeded ${ITEMS.length} media assets for Oscar.`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
