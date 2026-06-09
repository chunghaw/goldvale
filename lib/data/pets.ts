/**
 * Pet data access — the single seam the screens read through.
 *
 * With DATABASE_URL set, reads come live from Aurora (lib/data/queries.ts), which
 * exercises all four data-model layers. Without it, falls back to the domain-computed
 * demo view so `main` still renders. The PetView shape — and every component above
 * it — is identical either way.
 */
import { buildOscarView } from "./demo";
import { getPetViewFromDb } from "./queries";
import { OSCAR_PET_ID } from "./ids";
import type { PetView } from "./view";

const isLive = Boolean(process.env.DATABASE_URL);

/** Returns the full view for a pet, or null if unknown. */
export async function getPetView(id: string): Promise<PetView | null> {
  if (isLive) return getPetViewFromDb(id);
  const demo = buildOscarView();
  return id === demo.header.id ? demo : null;
}

/** The id the landing page links to for the demo flow (uuid live, slug in fallback). */
export const DEMO_PET_ID = isLive ? OSCAR_PET_ID : "oscar";

/** "mild" → "Mild" for band labels. */
export function bandLabel(band: string): string {
  return band.charAt(0).toUpperCase() + band.slice(1);
}
