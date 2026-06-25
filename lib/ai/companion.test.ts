import { afterEach, describe, expect, it, vi } from "vitest";
import {
  COMPANION_FALLBACK_TEXT,
  withCompanionFallback,
  type CompanionReply,
} from "./companion";
import { checkNonClinical, hasVetFraming } from "@/lib/domain/guardrails";

afterEach(() => vi.restoreAllMocks());

describe("companion fallback copy — the safety net when the agent throws", () => {
  it("passes the non-clinical guardrail", () => {
    expect(checkNonClinical(COMPANION_FALLBACK_TEXT).ok).toBe(true);
  });

  it("routes the owner back to their vet", () => {
    expect(hasVetFraming(COMPANION_FALLBACK_TEXT)).toBe(true);
  });

  it("is plain text — no markdown / bullets / emoji that render raw in chat", () => {
    expect(COMPANION_FALLBACK_TEXT).not.toMatch(/[*_`#>]|^\s*[-•]\s/m);
  });
});

describe("withCompanionFallback — agent errors yield the safe fallback", () => {
  it("returns the agent reply unchanged when no error", async () => {
    const reply: CompanionReply = { text: "noted.", cards: [{ type: "logged" }] };
    const result = await withCompanionFallback(async () => reply);
    expect(result).toBe(reply);
  });

  it("returns the non-clinical fallback when the agent throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await withCompanionFallback(async () => {
      throw new Error("Bedrock 500");
    });
    expect(result.text).toBe(COMPANION_FALLBACK_TEXT);
    expect(result.cards).toEqual([]);
    // double-check the guardrail at the boundary — paranoia by design
    expect(checkNonClinical(result.text).ok).toBe(true);
  });

  it("logs the underlying error so it is observable in production", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    await withCompanionFallback(async () => {
      throw new Error("connection refused");
    });
    expect(err).toHaveBeenCalledTimes(1);
    expect(String(err.mock.calls[0])).toMatch(/connection refused/);
  });
});
