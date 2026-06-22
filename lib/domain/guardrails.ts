/**
 * Non-clinical guardrails — the cardinal rule of Oscar.
 *
 * Oscar tracks, remembers, and prepares; it never diagnoses, grades, stages, or
 * prescribes. Bedrock Claude narrates trends and poses "questions for your vet";
 * this module enforces the boundary on any model-generated copy BEFORE it reaches
 * the user. Run every LLM output through assertNonClinical().
 */

/** Phrases that imply diagnosis / grading / staging / prescription — disallowed in user copy. */
const BANNED_PATTERNS: RegExp[] = [
  /\bdiagnos(e|is|ed|ing)\b/i,
  /\b(has|have|likely has|is suffering from)\s+(arthritis|osteoarthritis|dysplasia|ivdd|cancer|disease)\b/i,
  /\bstage\s*[0-4]\b/i,
  /\bcoast\s+stage\b/i,
  /\bgrade\s*[1-5]\b/i,
  /\blameness\s+grade\b/i,
  /\byou should (give|increase|start|stop|administer)\b/i, // dosing / treatment instruction
  /\b(prescrib|dosage|mg\/kg|mg per kg)\b/i,
  /\b(it'?s|this is)\s+(definitely|certainly)\b/i, // false certainty
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
