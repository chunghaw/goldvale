/**
 * Seed Oscar's media timeline from the REAL designer-shipped photos so the photo
 * library AND the pgvector VISUAL recall (kNN over Titan image embeddings) are
 * demo-real — no mock data, these are actual JPEGs in handoff/media/assets/.
 *
 * Seeds THROUGH saveMedia() (the exact live path: S3 upload → Titan embed →
 * media_assets insert), so what the demo shows is what the app would have written.
 *
 * Idempotent: wipes Oscar's media_assets first. All photos (no fake videos — we
 * have no real video files, so the "clips" count honestly stays 0).
 *
 * Standalone:  npx tsx --env-file=.env scripts/seed-demo-media.ts
 * Also called best-effort by scripts/seed-demo-pet.ts so one command rebuilds all.
 *
 * Story (TPLO Week-5 post-op): a 6-photo incision HEALING series oldest→newest,
 * plus a first-walk, a rest, a garden potter, and a back-step. Captions are owner
 * observations — non-clinical: no diagnosis, grading, or staging.
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

// Owner observations only — no diagnosis/grading. Oldest → newest healing series.
const PHOTOS: SeedPhoto[] = [
  { file: "media-incision-1.jpg", caption: "Incision — 1 week post-op", daysAgo: 33, mentionAtVet: true },
  { file: "media-incision-2.jpg", caption: "2 weeks — staples out", daysAgo: 26 },
  { file: "media-incision-3.jpg", caption: "3 weeks — closing well", daysAgo: 19 },
  { file: "media-incision-4.jpg", caption: "4 weeks", daysAgo: 12 },
  { file: "media-incision-5.jpg", caption: "5 weeks — fully healed", daysAgo: 6 },
  { file: "media-incision-6.jpg", caption: "Latest — clean and dry", daysAgo: 2, mentionAtVet: true },
  { file: "media-clip-garden.jpg", caption: "Pottering in the garden", daysAgo: 8 },
  { file: "media-walk.jpg", caption: "First proper walk to the end of the street", daysAgo: 5 },
  { file: "media-rest.jpg", caption: "Resting easy after rehab", daysAgo: 3 },
  { file: "media-clip-stairs.jpg", caption: "Taking the back step slowly", daysAgo: 1 },
];

/** Read a JPEG from the asset dir and build a base64 data URL. */
function dataUrlFor(file: string): string {
  const buf = readFileSync(join(ASSET_DIR, file));
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

export async function seedDemoMedia(): Promise<void> {
  const db = getDb();

  // ── idempotent: clear Oscar's existing media first ──
  await db.delete(mediaAssets).where(eq(mediaAssets.petId, OSCAR_PET_ID));

  let seeded = 0;
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
    seeded++;
    // verify the Titan embed landed (saveMedia degrades to null if Bedrock fails)
    const [row] = await db.select({ embedding: mediaAssets.embedding })
      .from(mediaAssets).where(eq(mediaAssets.id, id));
    if (row?.embedding != null) embedded++;
    else console.warn(`  ⚠ ${p.file} stored without an embedding (visual recall will skip it)`);
  }

  console.log(`✓ Seeded ${seeded} media photos for Oscar (${embedded}/${seeded} embedded)`);
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
