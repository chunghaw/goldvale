"use server";

/**
 * Daily check-in save server action — the write side of the wedge. Thin wrapper:
 * persists the check-in + child events (lib/data/checkin-write.ts), then revalidates
 * the dashboard so the new data shows. Non-clinical: it only RECORDS what the owner
 * reported — no scoring, no LLM judgement.
 */
import { revalidatePath } from "next/cache";
import { persistCheckin, type SaveCheckinInput } from "@/lib/data/checkin-write";
import { requirePetAccess } from "@/lib/auth/access";

export async function saveCheckin(input: SaveCheckinInput): Promise<{ ok: true }> {
  await requirePetAccess(input.petId);
  await persistCheckin(input);
  revalidatePath(`/pets/${input.petId}`);
  return { ok: true };
}
