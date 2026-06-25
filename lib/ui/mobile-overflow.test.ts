import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repo = join(__dirname, "..", "..");
const hero = readFileSync(join(repo, "components", "ui", "Hero.tsx"), "utf8");
const media = readFileSync(join(repo, "components", "media", "MediaTimelineScreen.tsx"), "utf8");
const checkin = readFileSync(join(repo, "components", "checkin", "CheckinScreen.tsx"), "utf8");
const companion = readFileSync(join(repo, "components", "companion", "CompanionScreen.tsx"), "utf8");

describe("mobile overflow — long content survives narrow viewports", () => {
  it("Hero title no longer forces whiteSpace:nowrap (long pet names wrap)", () => {
    // the title block still uses break-word + overflow-wrap rather than clipping
    expect(hero).toMatch(/wordBreak:\s*"break-word"/);
    expect(hero).toMatch(/overflowWrap:\s*"break-word"/);
    // the badge keeps its short-token nowrap (only one occurrence expected now)
    const nowraps = hero.match(/whiteSpace:\s*"nowrap"/g) ?? [];
    expect(nowraps.length).toBe(1);
  });

  it("Media timeline grid uses repeat(auto-fit, minmax(140px, 1fr))", () => {
    expect(media).toMatch(/repeat\(auto-fit,\s*minmax\(140px,\s*1fr\)\)/);
  });

  it("Tolerance pills wrap to a new row when the row runs out", () => {
    expect(checkin).toMatch(/flexWrap:\s*"wrap"/);
  });

  it("Chat bubbles cap via clamp() so a long message never overflows the viewport", () => {
    // both owner + agent bubbles get a clamp() ceiling
    const owner = companion.match(/maxWidth:\s*"clamp\(220px, 78%, 360px\)"/);
    const agent = companion.match(/maxWidth:\s*"clamp\(220px, 84%, 360px\)"/);
    expect(owner).not.toBeNull();
    expect(agent).not.toBeNull();
  });
});
