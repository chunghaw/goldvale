/**
 * FITT progression NUDGE — a suggestion, never an action.
 *
 * Goldvale never advances a pet's exercise dose on its own. When readiness criteria
 * are met it surfaces "consider asking your vet about progressing" — phrased as a
 * question. The vet decides and doses. (Active-exercise completion is the signal;
 * passive-modality logging is not.)
 */

export type Tolerance = "handled" | "a_bit_tired" | "sore" | "refused";

export interface Session {
  completedReps: number;
  targetReps: number;
  tolerance: Tolerance;
  at: Date;
}

export interface ProgressionConfig {
  /** consecutive clean sessions required before nudging */
  minCleanSessions: number;
  /** ...spanning at least this many days (~2 weeks per the rehab framework) */
  minSpanDays: number;
}

export const DEFAULT_PROGRESSION: ProgressionConfig = { minCleanSessions: 6, minSpanDays: 14 };

const POOR_TOLERANCE: Tolerance[] = ["sore", "refused"];

/** A "clean" session = hit target reps with non-poor tolerance. */
export function isCleanSession(s: Session): boolean {
  return s.completedReps >= s.targetReps && !POOR_TOLERANCE.includes(s.tolerance);
}

/**
 * Returns true if Goldvale should surface the "ask your vet about progressing"
 * nudge. Pure + deterministic; NEVER auto-advances — the UI shows it as a question.
 *
 * @param sessionsNewestFirst sessions ordered newest → oldest
 */
export function shouldNudgeProgression(
  sessionsNewestFirst: Session[],
  cfg: ProgressionConfig = DEFAULT_PROGRESSION,
): boolean {
  if (sessionsNewestFirst.length < cfg.minCleanSessions) return false;
  const recent = sessionsNewestFirst.slice(0, cfg.minCleanSessions);
  if (!recent.every(isCleanSession)) return false;
  const newest = recent[0].at.getTime();
  const oldest = recent[recent.length - 1].at.getTime();
  const spanDays = (newest - oldest) / (1000 * 60 * 60 * 24);
  return spanDays >= cfg.minSpanDays;
}
