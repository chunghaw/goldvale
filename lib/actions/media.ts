"use server";

/**
 * Media actions — visual-recall load, the "mention at vet" toggle, and upload
 * (S3 + Titan embed + media_assets, used by capture + photo-in-chat). Non-clinical:
 * keeps and surfaces the owner's media; never interprets it.
 */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import { mediaAssets } from "@/lib/db/schema";
import { getSimilarMedia, type MediaAnalogue } from "@/lib/data/media";
import { saveMedia, type SaveMediaInput } from "@/lib/data/media-write";
import { presignGet } from "@/lib/storage/s3";

export async function loadSimilar(input: { petId: string; mediaId: string }): Promise<MediaAnalogue[]> {
  return getSimilarMedia(input.petId, input.mediaId, 8);
}

export async function toggleMention(input: { mediaId: string; petId: string; value: boolean }): Promise<{ ok: true }> {
  const db = getDb();
  await db.update(mediaAssets).set({ mentionAtVet: input.value }).where(eq(mediaAssets.id, input.mediaId));
  revalidatePath(`/pets/${input.petId}/media`);
  return { ok: true };
}

export async function uploadMedia(
  input: SaveMediaInput,
): Promise<{ id: string; url: string; kind: "photo" | "video"; caption: string | null }> {
  const id = await saveMedia(input);
  const db = getDb();
  const [row] = await db.select({ url: mediaAssets.url, caption: mediaAssets.caption })
    .from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  revalidatePath(`/pets/${input.petId}/media`);
  return { id, url: await presignGet(row.url), kind: input.kind, caption: row.caption };
}
