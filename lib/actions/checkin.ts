"use server";

/**
 * Daily check-in save server action — the write side of the wedge. Thin wrapper:
 * persists the check-in + child events (lib/data/checkin-write.ts), then revalidates
 * the dashboard so the new data shows. Non-clinical: it only RECORDS what the owner
 * reported — no scoring, no LLM judgement.
 */
import { revalidatePath } from "next/cache";
import { persistCheckin, validateCheckinNote, type SaveCheckinInput } from "@/lib/data/checkin-write";
import { requirePetAccess } from "@/lib/auth/access";

export async function saveCheckin(input: SaveCheckinInput): Promise<{ ok: true }> {
  await requirePetAccess(input.petId);
  // bound the free-text note before it flows downstream — embedding cost +
  // prompt-injection surface are both length-sensitive. Non-clinical message.
  const bounded = validateCheckinNote(input.note);
  if (!bounded.ok) throw new Error(bounded.message);
  await persistCheckin({ ...input, note: bounded.note });
  revalidatePath(`/pets/${input.petId}`);
  return { ok: true };
}
