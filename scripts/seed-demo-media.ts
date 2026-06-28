/**
 * Seed Oscar's media timeline from REAL photos and video of Oscar — the senior dog
 * this app is named after, filmed as his mobility began to decline. Feeds the photo
 * library AND the pgvector VISUAL recall (kNN over Titan image embeddings) with
 * genuine, owner-supplied media — no stand-ins.
 *
 * Seeds THROUGH saveMedia() (the exact live path: S3 upload → Titan embed →
 * media_assets insert), so what the demo shows is what the app would have written.
 *
 * Idempotent: wipes Oscar's media_assets first. 6 photos (2 of Oscar + 4 frames
 * lifted from the clips, so visual recall has enough to cluster) and 4 short clips.
 * The clips are AUDIO-STRIPPED for privacy (muted with ffmpeg at prep time). Captions
 * are owner observations — non-clinical: no diagnosis, grading, or staging.
 *
 * Standalone:  npx tsx --env-file=.env scripts/seed-demo-media.ts
 * Also called best-effort by scripts/seed-demo-pet.ts so one command rebuilds all.
 *
 * Story (how he's moving, over the weeks): walking practice, a slow walk, still
 * perking up at dinner, resting on a lap, an afternoon nap, and the harder mornings
 * when his back legs are tired — oldest → newest, the two "mention at the vet" days
 * flagged.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/client";
import { mediaAssets } from "../lib/db/schema";
import { saveMedia } from "../lib/data/media-write";
import { OSCAR_PET_ID } from "../lib/data/ids";

const NOW = new Date("2026-06-09T09:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
/** A timestamp `d` days before NOW (all ≤ NOW, within the demo window). */
const daysAgo = (d: number) => new Date(NOW.getTime() - d * DAY);

const ASSET_DIR = join(__dirname, "..", "handoff", "media", "assets");

interface SeedPhoto {
  file: string;
  caption: string;
  daysAgo: number;
  mentionAtVet?: boolean;
}

// Real Oscar — owner observations only, no diagnosis/grading. Oldest → newest.
const PHOTOS: SeedPhoto[] = [
  { file: "oscar-walk-practice.jpg", caption: "Walking practice down the hallway", daysAgo: 28 },
  { file: "oscar-walk-still.jpg", caption: "Out for a slow walk", daysAgo: 22 },
  { file: "oscar-food-still.jpg", caption: "Still perks right up at dinner", daysAgo: 16 },
  { file: "oscar-rest-lap.jpg", caption: "Resting on my lap", daysAgo: 11 },
  { file: "oscar-sleep-still.jpg", caption: "Napping in the afternoon", daysAgo: 6 },
  { file: "oscar-bed-still.jpg", caption: "A harder morning — back legs tired", daysAgo: 2, mentionAtVet: true },
];

interface SeedVideo {
  file: string;
  caption: string;
  daysAgo: number;
  durationSec: number;
  mentionAtVet?: boolean;
}

// Real Oscar clips, AUDIO-STRIPPED for privacy. Captions are owner observations.
const VIDEOS: SeedVideo[] = [
  { file: "oscar-walk.mp4", caption: "A slow walk outside", daysAgo: 23, durationSec: 34 },
  { file: "oscar-food.mp4", caption: "Excited for dinner", daysAgo: 15, durationSec: 45 },
  { file: "oscar-sleep.mp4", caption: "Sleeping easy", daysAgo: 8, durationSec: 3 },
  { file: "oscar-bed.mp4", caption: "Lying down — back legs weak today", daysAgo: 3, durationSec: 11, mentionAtVet: true },
];

/** Read a JPEG from the asset dir and build a base64 data URL. */
function dataUrlFor(file: string): string {
  const buf = readFileSync(join(ASSET_DIR, file));
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

/** Read an mp4 from the asset dir and build a base64 data URL. */
function videoDataUrlFor(file: string): string {
  const buf = readFileSync(join(ASSET_DIR, file));
  return `data:video/mp4;base64,${buf.toString("base64")}`;
}

export async function seedDemoMedia(): Promise<void> {
  const db = getDb();

  // ── idempotent: clear Oscar's existing media first ──
  await db.delete(mediaAssets).where(eq(mediaAssets.petId, OSCAR_PET_ID));

  let photos = 0;
  let embedded = 0;
  for (const p of PHOTOS) {
    const id = await saveMedia({
      petId: OSCAR_PET_ID,
      kind: "photo",
      dataUrl: dataUrlFor(p.file),
      caption: p.caption,
      mentionAtVet: p.mentionAtVet ?? false,
      recordedAt: daysAgo(p.daysAgo),
    });
    photos++;
    // verify the Titan embed landed (saveMedia degrades to null if Bedrock fails)
    const [row] = await db.select({ embedding: mediaAssets.embedding })
      .from(mediaAssets).where(eq(mediaAssets.id, id));
    if (row?.embedding != null) embedded++;
    else console.warn(`  ⚠ ${p.file} stored without an embedding (visual recall will skip it)`);
  }

  // ── real video clips (no embedding — videos aren't part of visual recall) ──
  let videos = 0;
  for (const v of VIDEOS) {
    await saveMedia({
      petId: OSCAR_PET_ID,
      kind: "video",
      dataUrl: videoDataUrlFor(v.file),
      caption: v.caption,
      durationSec: v.durationSec,
      mentionAtVet: v.mentionAtVet ?? false,
      recordedAt: daysAgo(v.daysAgo),
    });
    videos++;
  }

  console.log(`✓ Seeded ${photos} photos (${embedded}/${photos} embedded) + ${videos} clips for Oscar`);
}

// Run standalone when invoked directly.
if (require.main === module) {
  seedDemoMedia()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
