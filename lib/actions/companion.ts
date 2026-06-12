"use server";

/**
 * Companion chat send — persists the owner's message, runs the agent (Bedrock +
 * Aurora tools + guardrail), persists the reply, and returns both turns. The agent
 * is non-clinical by construction (see lib/ai/companion.ts).
 */
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { pets } from "@/lib/db/schema";
import { runCompanion, type ChatTurn } from "@/lib/ai/companion";
import { appendAssistant, appendOwner, getOrCreateThread, loadMessages, type ChatMessageView } from "@/lib/data/chat";

export async function sendCompanionMessage(
  input: { petId: string; text: string },
): Promise<{ owner: ChatMessageView; assistant: ChatMessageView }> {
  const { petId, text } = input;
  const db = getDb();
  const [pet] = await db.select({ name: pets.name }).from(pets).where(eq(pets.id, petId)).limit(1);
  const petName = pet?.name ?? "your pet";

  const threadId = await getOrCreateThread(petId);
  const ownerId = await appendOwner(threadId, text);

  const history = (await loadMessages(threadId)).map<ChatTurn>((m) => ({ role: m.role, text: m.text ?? "" }));
  const reply = await runCompanion({ petId, petName, history });
  const assistantId = await appendAssistant(threadId, reply.text, reply.cards);

  return {
    owner: { id: ownerId, role: "owner", text, cards: [], media: [] },
    assistant: { id: assistantId, role: "assistant", text: reply.text, cards: reply.cards, media: [] },
  };
}
