import { describe, expect, it } from "vitest";
import { MAX_CHECKIN_NOTE_LEN, validateCheckinNote } from "./checkin-write";
import { checkNonClinical } from "@/lib/domain/guardrails";

describe("validateCheckinNote — bounds the free-text check-in note", () => {
  it("accepts and trims a normal note", () => {
    const r = validateCheckinNote("  Slept well last night.  ");
    expect(r).toEqual({ ok: true, note: "Slept well last night." });
  });

  it("accepts a note exactly at the limit", () => {
    const r = validateCheckinNote("x".repeat(MAX_CHECKIN_NOTE_LEN));
    expect(r.ok).toBe(true);
  });

  it("rejects a note one over the limit (post-trim)", () => {
    const r = validateCheckinNote("x".repeat(MAX_CHECKIN_NOTE_LEN + 1));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      // friendly, non-clinical message that nudges the owner to retry
      expect(r.message).toMatch(/2000/);
      expect(checkNonClinical(r.message).ok).toBe(true);
    }
  });

  it("treats whitespace as not contributing — leading/trailing pad doesn't trip the cap", () => {
    const padded = "  " + "x".repeat(MAX_CHECKIN_NOTE_LEN) + "  ";
    const r = validateCheckinNote(padded);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.note.length).toBe(MAX_CHECKIN_NOTE_LEN);
  });

  it("an empty note is allowed (the note field is optional in the UI)", () => {
    expect(validateCheckinNote("")).toEqual({ ok: true, note: "" });
    expect(validateCheckinNote("   ")).toEqual({ ok: true, note: "" });
  });
});
