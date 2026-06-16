/**
 * Server-action access guard. The page routes are protected by app/pets/[id]/layout.tsx,
 * but server actions are POST endpoints called directly — they must re-check ownership
 * themselves or an authenticated user could pass another owner's petId.
 *
 * Policy (mirrors the layout): the public demo pet is open to everyone so the interactive
 * demo works without an account; every other pet requires a session that owns it.
 */
import { auth } from "@/auth";
import { DEMO_PET_ID } from "@/lib/data/pets";
import { ownerOwnsPet } from "@/lib/data/ownership";

export async function requirePetAccess(petId: string): Promise<void> {
  if (petId === DEMO_PET_ID) return; // public, interactive demo pet
  const session = await auth();
  if (!session?.user?.ownerId) throw new Error("Not signed in.");
  if (!(await ownerOwnsPet(session.user.ownerId, petId))) {
    throw new Error("You don't have access to this pet.");
  }
}
