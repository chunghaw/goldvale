"use server";

/**
 * Companion chat send — persists the owner's message (with an optional photo uploaded
 * to S3), runs the agent (Bedrock + Aurora tools + guardrail, multimodal when a photo
 * is attached), persists the reply, and returns both turns. Non-clinical by construction.
 */
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { pets, mediaAssets } from "@/lib/db/schema";
import { runCompanion, withCompanionFallback, type ChatTurn } from "@/lib/ai/companion";
import {
  appendAssistant, appendOwner, createThread, getOrCreateThread, loadMessages,
  type ChatMessageView, type MediaRef, type StoredMediaRef,
} from "@/lib/data/chat";
import { saveMedia } from "@/lib/data/media-write";
import { decodeDataUrl, presignGet } from "@/lib/storage/s3";
import { requirePetAccess } from "@/lib/auth/access";

export async function sendCompanionMessage(
  input: { petId: string; text: string; imageDataUrl?: string },
): Promise<{ owner: ChatMessageView; assistant: ChatMessageView }> {
  const { petId, text } = input;
  await requirePetAccess(petId);
  const db = getDb();
  const [pet] = await db.select({ name: pets.name }).from(pets).where(eq(pets.id, petId)).limit(1);
  const petName = pet?.name ?? "your pet";
  const threadId = await getOrCreateThread(petId);

  let storedMedia: StoredMediaRef[] = [];
  let ownerMedia: MediaRef[] = [];
  let image: { base64: string; mediaType: string } | undefined;

  if (input.imageDataUrl) {
    const { buffer, contentType } = decodeDataUrl(input.imageDataUrl);
    const mediaId = await saveMedia({ petId, kind: "photo", dataUrl: input.imageDataUrl, caption: "Shared in chat" });
    const [m] = await db.select({ url: mediaAssets.url }).from(mediaAssets).where(eq(mediaAssets.id, mediaId)).limit(1);
    storedMedia = [{ key: m.url, kind: "photo" }];
    ownerMedia = [{ url: await presignGet(m.url), kind: "photo" }];
    image = { base64: buffer.toString("base64"), mediaType: contentType };
  }

  const ownerId = await appendOwner(threadId, text, storedMedia);
  const history = (await loadMessages(threadId)).map<ChatTurn>((m) => ({ role: m.role, text: m.text ?? "" }));
  // If the agent or any tool throws (Bedrock outage, embedText hiccup, DB
  // blip), withCompanionFallback returns a safe non-clinical reply that still
  // routes urgent concern to the vet — the client never sees a thrown chat.
  const reply = await withCompanionFallback(() => runCompanion({ petId, petName, history, image }));
  const assistantId = await appendAssistant(threadId, reply.text, reply.cards);

  return {
    owner: { id: ownerId, role: "owner", text, cards: [], media: ownerMedia },
    assistant: { id: assistantId, role: "assistant", text: reply.text, cards: reply.cards, media: [] },
  };
}

/** Start a fresh chat session — subsequent messages land in this new thread. */
export async function startNewCompanionChat(petId: string): Promise<void> {
  await requirePetAccess(petId);
  await createThread(petId);
}
