import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  COMPANION_FALLBACK_TEXT,
  COMPANION_TOOL_LIMITS,
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

describe("companion tool input limits — bound embedding cost + injection surface", () => {
  // Mirror the schemas the tools use internally. If COMPANION_TOOL_LIMITS
  // drifts from the actual tool schemas, this test still catches the bound
  // contract; a build-level guard inside runCompanion already enforces them.
  const journal = z.string().min(1).max(COMPANION_TOOL_LIMITS.journal);
  const query = z.string().min(1).max(COMPANION_TOOL_LIMITS.query);

  it("publishes sensible upper bounds", () => {
    expect(COMPANION_TOOL_LIMITS.journal).toBe(2000);
    expect(COMPANION_TOOL_LIMITS.query).toBe(500);
  });

  it("journal-shaped input accepts a normal note and rejects over-long input", () => {
    expect(journal.safeParse("Slept well.").success).toBe(true);
    expect(journal.safeParse("x".repeat(COMPANION_TOOL_LIMITS.journal)).success).toBe(true);
    expect(journal.safeParse("x".repeat(COMPANION_TOOL_LIMITS.journal + 1)).success).toBe(false);
    expect(journal.safeParse("").success).toBe(false);
  });

  it("query-shaped input is capped tighter (it's a search phrase, not an essay)", () => {
    expect(query.safeParse("stiff getting up").success).toBe(true);
    expect(query.safeParse("x".repeat(COMPANION_TOOL_LIMITS.query)).success).toBe(true);
    expect(query.safeParse("x".repeat(COMPANION_TOOL_LIMITS.query + 1)).success).toBe(false);
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
