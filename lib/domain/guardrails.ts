/**
 * Non-clinical guardrails — the cardinal rule of Oscar.
 *
 * Oscar tracks, remembers, and prepares; it never diagnoses, grades, stages, or
 * prescribes. Bedrock Claude narrates trends and poses "questions for your vet";
 * this module enforces the boundary on any model-generated copy BEFORE it reaches
 * the user. Run every LLM output through assertNonClinical().
 */

/**
 * Phrases that imply diagnosis / grading / staging / prescription — disallowed
 * in any LLM-emitted user copy. Over-banning here is by design: the cardinal
 * rule is NON-CLINICAL, and the LLM never needs to use clinical hedges like
 * "consistent with" or "resembles" (recall is framed as the OWNER's past notes,
 * not as clinical pattern-matching). False positives surface in tests, real
 * ones never reach the user.
 */
const BANNED_PATTERNS: RegExp[] = [
  // ── explicit diagnosis verbs ────────────────────────────────────────────
  // include plural / 3rd-person singular ("diagnoses", "misdiagnoses") — the
  // alternation must enumerate every inflection because `\b` after `diagnos`
  // sits between two word chars and never fires on the bare stem.
  /\bdiagnos(e|es|is|ed|ing)\b/i,
  /\bmis-?diagnos(e|es|is|ed|ing)\b/i,
  /\bundiagnosed\b/i,
  // ── condition attribution — present + past + hedged ─────────────────────
  /\b(has|have|had|likely has|likely had|is suffering from|was suffering from)\s+(arthritis|osteoarthritis|hip dysplasia|elbow dysplasia|dysplasia|ivdd|cancer|disease)\b/i,
  // ── clinical-inference hedges (the LLM never needs these) ───────────────
  /\bsuspect(s|ed|ing)?\b/i,
  /\bconsistent with\b/i,
  /\bresembl(e|es|ed|ing)\b/i,
  /\btypical of\b/i,
  /\bsuggestive of\b/i,
  // verb form: "this suggests arthritis" is clinical inference even though
  // "suggestive of" is already covered. parallel to how `suspect` is banned.
  /\bsuggest(s|ed|ing)\b/i,
  // ── staging / grading ───────────────────────────────────────────────────
  /\bstage\s*[0-4]\b/i,
  /\bcoast\s+stage\b/i,
  /\bgrade\s*[1-5]\b/i,
  /\blameness\s+grade\b/i,
  // ── dosing / prescription ───────────────────────────────────────────────
  /\byou should (give|increase|start|stop|administer)\b/i,
  // the bare `\bprescrib\b` form never matched "prescribe" because the trailing
  // `\b` falls between two word chars — expand to the actual inflections.
  /\b(prescrib(e|es|ed|ing|tion)|dosage|mg\/kg|mg per kg)\b/i,
  // ── false certainty ─────────────────────────────────────────────────────
  /\b(it'?s|this is)\s+(definitely|certainly)\b/i,
];

/** Framings we WANT present in a trend narrative (route the owner back to the vet). */
const SAFE_FRAMINGS: RegExp[] = [
  /worth mentioning to your vet/i,
  /question(s)? (for|to discuss with) your vet/i,
  /ask your vet/i,
  /supports your vet'?s plan/i,
  /your vet (decides|will|can)/i,
  /contact your vet/i,
];

export interface GuardResult {
  ok: boolean;
  violations: string[];
}

/** Returns violations if model copy crosses the non-clinical line. */
export function checkNonClinical(text: string): GuardResult {
  const violations: string[] = [];
  for (const re of BANNED_PATTERNS) {
    const m = text.match(re);
    if (m) violations.push(`disallowed phrase: "${m[0]}"`);
  }
  return { ok: violations.length === 0, violations };
}

/** Throws if copy is clinical — use in the LLM output path so nothing unsafe ships. */
export function assertNonClinical(text: string): void {
  const r = checkNonClinical(text);
  if (!r.ok) {
    throw new Error(`Non-clinical guardrail failed: ${r.violations.join("; ")}`);
  }
}

/** True if a trend narrative carries an explicit "talk to your vet" framing. */
export function hasVetFraming(text: string): boolean {
  return SAFE_FRAMINGS.some((re) => re.test(text));
}
