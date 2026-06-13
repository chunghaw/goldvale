/**
 * Companion chat persistence — get-or-create the pet's thread, load and append
 * messages. Rich-card payloads (agent tool outputs) and media refs ride along as
 * jsonb so the thread re-renders exactly on reload (the "remembers" story).
 */
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { chatThreads, chatMessages } from "@/lib/db/schema";
import { presignGet } from "@/lib/storage/s3";
import type { CompanionCard } from "@/lib/ai/companion";

/** Stored in chat_messages.media (jsonb) — the S3 key, presigned on read. */
export interface StoredMediaRef {
  key: string;
  kind: "photo" | "video";
  caption?: string;
}

/** What the UI receives — a presigned url. */
export interface MediaRef {
  url: string;
  kind: "photo" | "video";
  caption?: string;
}

export interface ChatMessageView {
  id: string;
  role: "owner" | "assistant";
  text: string | null;
  cards: CompanionCard[];
  media: MediaRef[];
}

export async function getOrCreateThread(petId: string): Promise<string> {
  const db = getDb();
  const [existing] = await db.select({ id: chatThreads.id }).from(chatThreads)
    .where(eq(chatThreads.petId, petId)).orderBy(asc(chatThreads.createdAt)).limit(1);
  if (existing) return existing.id;
  const [created] = await db.insert(chatThreads).values({ petId }).returning({ id: chatThreads.id });
  return created.id;
}

export async function loadMessages(threadId: string): Promise<ChatMessageView[]> {
  const db = getDb();
  const rows = await db.select().from(chatMessages)
    .where(eq(chatMessages.threadId, threadId)).orderBy(asc(chatMessages.createdAt));
  return Promise.all(rows.map(async (r) => ({
    id: r.id,
    role: r.role,
    text: r.text,
    cards: (r.cards as CompanionCard[] | null) ?? [],
    media: await Promise.all(((r.media as StoredMediaRef[] | null) ?? []).map(async (m) => ({
      url: await presignGet(m.key), kind: m.kind, caption: m.caption,
    }))),
  })));
}

export async function appendOwner(threadId: string, text: string, media: StoredMediaRef[] = []): Promise<string> {
  const db = getDb();
  const [m] = await db.insert(chatMessages).values({
    threadId, role: "owner", text: text || null, media: media.length ? media : null,
  }).returning({ id: chatMessages.id });
  return m.id;
}

export async function appendAssistant(threadId: string, text: string, cards: CompanionCard[]): Promise<string> {
  const db = getDb();
  const [m] = await db.insert(chatMessages).values({
    threadId, role: "assistant", text, cards: cards.length ? cards : null,
  }).returning({ id: chatMessages.id });
  return m.id;
}
