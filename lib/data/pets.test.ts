import { describe, expect, it } from "vitest";
import { clockFor, DEMO_NOW } from "./pets";
import { OSCAR_PET_ID } from "./ids";

describe("clockFor — the demo pet is frozen, every other pet is live", () => {
  it("returns the frozen demo wall-clock for the seeded demo pet", () => {
    expect(clockFor(OSCAR_PET_ID).toISOString()).toBe(DEMO_NOW.toISOString());
    // explicit so a stray edit can't silently re-anchor the demo
    expect(DEMO_NOW.toISOString()).toBe("2026-06-09T09:00:00.000Z");
  });

  it("returns a fresh Date each call so callers can mutate without leakage", () => {
    const a = clockFor(OSCAR_PET_ID);
    a.setUTCFullYear(1999);
    expect(clockFor(OSCAR_PET_ID).getUTCFullYear()).toBe(2026);
  });

  it("returns a live new Date() for any non-demo pet (the bug this fixes)", () => {
    const before = Date.now();
    const live = clockFor("a0c5ca9e-1234-4000-8000-000000000999").getTime();
    const after = Date.now();
    expect(live).toBeGreaterThanOrEqual(before);
    expect(live).toBeLessThanOrEqual(after);
    // and definitely not the demo's frozen instant
    expect(live).not.toBe(DEMO_NOW.getTime());
  });
});
