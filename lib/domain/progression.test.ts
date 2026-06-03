import { describe, it, expect } from "vitest";
import { shouldNudgeProgression, isCleanSession } from "./progression";
import type { Session } from "./progression";

const day = (n: number) => new Date(2026, 5, n); // June 2026
const clean = (at: Date): Session => ({ completedReps: 10, targetReps: 10, tolerance: "handled", at });

describe("FITT progression nudge (suggestion, never an action)", () => {
  it("classifies clean sessions", () => {
    expect(isCleanSession(clean(day(1)))).toBe(true);
    expect(isCleanSession({ completedReps: 8, targetReps: 10, tolerance: "handled", at: day(1) })).toBe(false);
    expect(isCleanSession({ completedReps: 10, targetReps: 10, tolerance: "sore", at: day(1) })).toBe(false);
  });

  it("nudges after 6 clean sessions spanning >=14 days", () => {
    const sessions = [day(20), day(17), day(14), day(10), day(7), day(3)].map(clean); // span 17 days
    expect(shouldNudgeProgression(sessions)).toBe(true);
  });

  it("does NOT nudge when the span is too short", () => {
    const sessions = [day(6), day(5), day(4), day(3), day(2), day(1)].map(clean); // span 5 days
    expect(shouldNudgeProgression(sessions)).toBe(false);
  });

  it("does NOT nudge when a recent session was poorly tolerated", () => {
    const sessions = [day(20), day(17), day(14), day(10), day(7), day(3)].map(clean);
    sessions[1].tolerance = "sore";
    expect(shouldNudgeProgression(sessions)).toBe(false);
  });

  it("does NOT nudge with too few sessions", () => {
    expect(shouldNudgeProgression([clean(day(1))])).toBe(false);
  });
});
