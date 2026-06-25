import { describe, it, expect } from "vitest";
import { assertNonClinical, checkNonClinical, hasVetFraming } from "./guardrails";
import { COMPANION_FALLBACK_TEXT } from "@/lib/ai/companion";

describe("non-clinical guardrails — block any LLM copy that diagnoses, grades, stages, or prescribes", () => {
  it("flags diagnosis verbs (original cases stay caught)", () => {
    expect(checkNonClinical("Bella likely has arthritis").ok).toBe(false);
    expect(checkNonClinical("This is COAST stage 3").ok).toBe(false);
    expect(checkNonClinical("You should increase the dose").ok).toBe(false);
    expect(checkNonClinical("lameness grade 2").ok).toBe(false);
    expect(checkNonClinical("We can diagnose hip dysplasia").ok).toBe(false);
  });

  it("assertNonClinical throws on clinical copy", () => {
    expect(() => assertNonClinical("We diagnose hip dysplasia")).toThrow(/guardrail/i);
  });
});

// ─── adversarial corpus: phrasings that MUST be blocked ─────────────────────
const MUST_BLOCK: { label: string; text: string }[] = [
  // diagnosis verb variants
  { label: "diagnose", text: "We diagnose hip dysplasia at the next visit." },
  { label: "diagnosed", text: "Bella was diagnosed with arthritis last year." },
  { label: "diagnosing", text: "I'm diagnosing the early signs of disease." },
  // plural / 3rd-person singular — the original regex never caught these
  { label: "diagnoses (verb 3rd-person)", text: "This pattern diagnoses hip dysplasia." },
  { label: "diagnoses (plural noun)", text: "Two diagnoses are on the table." },
  { label: "misdiagnos", text: "Looks like a misdiagnosis from last year." },
  { label: "mis-diagnos", text: "It was mis-diagnosed last year." },
  { label: "misdiagnoses (plural)", text: "Multiple misdiagnoses occurred." },
  { label: "undiagnosed", text: "This could be undiagnosed osteoarthritis." },
  // condition attribution — present / past / hedged
  { label: "has arthritis", text: "Oscar has arthritis." },
  { label: "have arthritis", text: "Dogs his age have arthritis often." },
  { label: "had arthritis", text: "He had arthritis last year." },
  { label: "likely has", text: "He likely has osteoarthritis." },
  { label: "likely had", text: "She likely had elbow dysplasia." },
  { label: "is suffering from", text: "He is suffering from IVDD." },
  { label: "was suffering from", text: "She was suffering from cancer." },
  // hedged-diagnosis evasions the LLM might try
  { label: "suspect", text: "I suspect arthritis." },
  { label: "suspects", text: "The pattern suspects disease." },
  { label: "suspected", text: "She is a suspected case of dysplasia." },
  { label: "consistent with", text: "These findings are consistent with hip dysplasia." },
  { label: "resembles", text: "This resembles arthritis in older dogs." },
  { label: "resembling", text: "Symptoms resembling early IVDD." },
  { label: "typical of", text: "That stiffness is typical of osteoarthritis." },
  { label: "suggestive of", text: "Findings suggestive of disease progression." },
  // verb form — distinct from the adjective form
  { label: "suggests", text: "This suggests arthritis." },
  { label: "suggested", text: "The pattern suggested dysplasia." },
  { label: "suggesting", text: "Symptoms suggesting hip dysplasia." },
  // staging / grading
  { label: "COAST stage", text: "This is COAST stage 3." },
  { label: "stage 0", text: "stage 0 disease activity" },
  { label: "stage 4", text: "appears stage 4" },
  { label: "grade 2", text: "lameness grade 2 observed" },
  { label: "lameness grade", text: "Lameness grade noted on the left." },
  // dosing / prescription
  { label: "you should give", text: "You should give 100mg in the morning." },
  { label: "you should start", text: "You should start gabapentin tonight." },
  { label: "prescrib", text: "I prescribe carprofen daily." },
  { label: "dosage", text: "The right dosage is 75 mg." },
  { label: "mg/kg", text: "Try 2 mg/kg twice daily." },
  // false certainty
  { label: "it's definitely", text: "It's definitely arthritis." },
  { label: "this is certainly", text: "This is certainly a flare." },
];

describe("guardrail — adversarial corpus (every phrase MUST block)", () => {
  it.each(MUST_BLOCK)("blocks: $label", ({ text }) => {
    const r = checkNonClinical(text);
    expect(r.ok).toBe(false);
    // and we want a violation message that names the offending phrase
    expect(r.violations.length).toBeGreaterThan(0);
  });
});

// ─── safe corpus: real app strings + plausible safe narratives MUST pass ────
const MUST_PASS: { label: string; text: string }[] = [
  { label: "vet-routing trend copy", text: "Bella's mobility has drifted down this month — worth mentioning to your vet." },
  { label: "vet-routing question", text: "A pattern worth mentioning at your next vet visit." },
  { label: "progression-nudge question", text: "That can be a sign they're ready for a little more. It's your vet's call — want to raise it with Dr. Okafor?" },
  { label: "progression-nudge headline", text: "Oscar has had 6 clean rehab sessions over 18 days." }, // "has had" follows but isn't a condition
  { label: "company fallback (current)", text: COMPANION_FALLBACK_TEXT },
  { label: "MCID flag narration", text: "GenPup-M is 34 now vs 42 four weeks ago — past the point we flag as meaningful. Still in the mild band." },
  { label: "QoL weekly recap", text: "A gentle week overall, holding steady. Worth keeping an eye on the lower days." },
  { label: "pattern recall lead", text: "Slower rising has shown up 3 times in 2 weeks." },
  { label: "pattern detail", text: "Harder getting up from lying down on May 22, May 30, and Jun 4 — clustered in the mornings." },
  { label: "red-flag escalation guidance", text: "Contact your vet now." },
  { label: "neutral observation", text: "He drank a good amount of water this morning." },
  { label: "owner-empathy reply", text: "I've made a note of that. Let me know if anything else stands out." },
  { label: "exercise log confirmation", text: "Saved the sit-to-stand session. Want me to add a question for the vet?" },
  { label: "ambient time/date copy", text: "It's Thursday afternoon and the streak is at 34 days." },
  { label: "vague but vet-routed", text: "If anything feels off, please contact your vet." },
];

describe("guardrail — safe corpus (every phrase MUST pass, no false positives)", () => {
  it.each(MUST_PASS)("passes: $label", ({ text }) => {
    const r = checkNonClinical(text);
    expect(r.ok).toBe(true);
    expect(r.violations).toEqual([]);
  });
});

describe("guardrail — sanity: vet-routing detection", () => {
  it("recognizes the vet-routing phrases the safe corpus uses", () => {
    expect(hasVetFraming("worth mentioning to your vet")).toBe(true);
    expect(hasVetFraming("If anything feels off, please contact your vet.")).toBe(true);
    expect(hasVetFraming("Ask your vet about it.")).toBe(true);
    expect(hasVetFraming("Just a quiet afternoon.")).toBe(false);
  });
});
