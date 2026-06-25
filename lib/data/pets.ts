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

/**
 * The frozen wall-clock the seeded demo pet (Oscar) is anchored to. Every
 * trend, "this week", and "X days ago" computation against the demo uses this
 * constant so its history reads consistently regardless of when a judge opens
 * the app. Real-user pets get `new Date()` — see `clockFor()`.
 */
export const DEMO_NOW = new Date("2026-06-09T09:00:00Z");

/**
 * Picks the right wall-clock for a pet:
 *   - the seeded demo pet → frozen `DEMO_NOW` so its history reads correctly
 *   - any other (real-user) pet → live `new Date()`
 *
 * Exported so callers (pages, media route) can pass the same clock the view
 * layer used into sibling data functions like `getMediaTimeline`.
 */
export function clockFor(petId: string): Date {
  return petId === OSCAR_PET_ID ? new Date(DEMO_NOW) : new Date();
}

/**
 * Returns the full view for a pet, or null if unknown.
 *
 * `now` defaults to `clockFor(id)`. Inject it in tests to drive a deterministic
 * clock without changing the production behavior.
 */
export async function getPetView(id: string, now: Date = clockFor(id)): Promise<PetView | null> {
  if (isLive) return getPetViewFromDb(id, now);
  const demo = buildOscarView();
  return id === demo.header.id ? demo : null;
}

/** The id the landing page links to for the demo flow (uuid live, slug in fallback). */
export const DEMO_PET_ID = isLive ? OSCAR_PET_ID : "oscar";

/** "mild" → "Mild" for band labels. */
export function bandLabel(band: string): string {
  return band.charAt(0).toUpperCase() + band.slice(1);
}
