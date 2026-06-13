/**
 * Media persistence — upload bytes to S3, embed photos with Titan (for visual
 * recall), and insert the media_assets row. Pure write core (testable; no
 * "use server"). Non-clinical: it keeps the owner's media, it never interprets it.
 */
import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db/client";
import { mediaAssets } from "@/lib/db/schema";
import { putObject, decodeDataUrl } from "@/lib/storage/s3";
import { embedImage } from "@/lib/ai/bedrock";

export interface SaveMediaInput {
  petId: string;
  kind: "photo" | "video";
  /** data:<mime>;base64,... */
  dataUrl: string;
  caption?: string;
  durationSec?: number;
  mentionAtVet?: boolean;
  journalEntryId?: string | null;
  recordedAt?: Date;
}

/** Upload + (for photos) embed + insert. Returns the new media id. */
export async function saveMedia(input: SaveMediaInput): Promise<string> {
  const db = getDb();
  const { buffer, contentType } = decodeDataUrl(input.dataUrl);
  const ext = contentType.split("/")[1]?.split("+")[0] || "bin";
  const key = `pets/${input.petId}/${randomUUID()}.${ext}`;
  await putObject(key, buffer, contentType);

  let embedding: number[] | null = null;
  if (input.kind === "photo") {
    try {
      embedding = await embedImage(buffer.toString("base64"), input.caption);
    } catch {
      embedding = null; // recall degrades gracefully if the image embed fails
    }
  }

  const [row] = await db.insert(mediaAssets).values({
    petId: input.petId,
    kind: input.kind,
    url: key, // store the S3 key; the app serves via presigned GET
    caption: input.caption ?? null,
    durationSec: input.durationSec ?? null,
    mentionAtVet: input.mentionAtVet ?? false,
    journalEntryId: input.journalEntryId ?? null,
    embedding,
    ...(input.recordedAt ? { recordedAt: input.recordedAt } : {}),
  }).returning({ id: mediaAssets.id });
  return row.id;
}
