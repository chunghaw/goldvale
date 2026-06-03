import { describe, it, expect } from "vitest";
import { checkNonClinical, assertNonClinical, hasVetFraming } from "./guardrails";

describe("non-clinical guardrails", () => {
  it("flags diagnosis / staging / grading / dosing language", () => {
    expect(checkNonClinical("Bella likely has arthritis").ok).toBe(false);
    expect(checkNonClinical("This is COAST stage 3").ok).toBe(false);
    expect(checkNonClinical("You should increase the dose").ok).toBe(false);
    expect(checkNonClinical("lameness grade 2").ok).toBe(false);
    expect(checkNonClinical("We can diagnose hip dysplasia").ok).toBe(false);
  });

  it("passes safe, vet-routing trend copy", () => {
    const ok = "Bella's mobility has drifted down this month — worth mentioning to your vet.";
    expect(checkNonClinical(ok).ok).toBe(true);
    expect(hasVetFraming(ok)).toBe(true);
  });

  it("assertNonClinical throws on clinical copy", () => {
    expect(() => assertNonClinical("We diagnose hip dysplasia")).toThrow(/guardrail/i);
  });
});
