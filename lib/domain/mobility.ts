/**
 * GenPup-M mobility scoring — DETERMINISTIC, computed in code (never the LLM).
 *
 * GenPup-M is a 24-item owner-reported canine mobility instrument (PLOS ONE 2023,
 * PMC10752556, CC-BY) we can legally embed; item wording is seeded from the
 * published supplementary file S2. This module owns the SCORING, banding, and
 * change-detection logic — the LLM only narrates the result.
 *
 * Non-clinical stance: we report a trend vs the pet's OWN baseline and flag a
 * "meaningful change worth mentioning to your vet" — never a diagnosis or grade.
 * Higher total = worse mobility (more impairment). Verify item polarity against
 * the published instrument before launch.
 */

export type MobilityBand = "none" | "mild" | "moderate" | "severe";

/** Published GenPup-M total bands: 0–27 none, 28–54 mild, 55–82 moderate, 83–108 severe. */
export const GENPUP_M = {
  id: "genpup_m",
  itemCount: 24,
  min: 0,
  max: 108,
  bands: [
    { band: "none" as const, lo: 0, hi: 27 },
    { band: "mild" as const, lo: 28, hi: 54 },
    { band: "moderate" as const, lo: 55, hi: 82 },
    { band: "severe" as const, lo: 83, hi: 108 },
  ],
  /** Minimal change we treat as meaningful. Placeholder until a validated MCID is set. */
  mcid: 8,
} as const;

export function bandFor(total: number): MobilityBand {
  const b = GENPUP_M.bands.find((x) => total >= x.lo && total <= x.hi);
  return b?.band ?? "severe";
}

export function scoreGenPupM(itemResponses: number[]): { total: number; band: MobilityBand } {
  if (itemResponses.length !== GENPUP_M.itemCount) {
    throw new Error(`GenPup-M expects ${GENPUP_M.itemCount} items, got ${itemResponses.length}`);
  }
  const total = itemResponses.reduce((a, b) => a + b, 0);
  if (total < GENPUP_M.min || total > GENPUP_M.max) {
    throw new Error(`GenPup-M total ${total} out of range ${GENPUP_M.min}-${GENPUP_M.max}`);
  }
  return { total, band: bandFor(total) };
}

/**
 * Change detection vs the pet's own baseline. Returns whether the change crosses
 * the instrument's MCID — the trigger for "worth mentioning to your vet". This is
 * NOT a diagnosis: just "this much movement is meaningful per the instrument."
 */
export function crossedMcid(current: number, baseline: number, mcid: number = GENPUP_M.mcid): boolean {
  return Math.abs(current - baseline) >= mcid;
}

/** Direction of change for plain-language framing (higher total = worse mobility). */
export function changeDirection(current: number, baseline: number): "worse" | "better" | "stable" {
  const d = current - baseline;
  if (d > 0) return "worse";
  if (d < 0) return "better";
  return "stable";
}
