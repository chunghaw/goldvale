import { describe, it, expect } from "vitest";
import { scoreGenPupM, bandFor, crossedMcid, changeDirection } from "./mobility";

describe("GenPup-M scoring (deterministic)", () => {
  it("sums items and assigns a band", () => {
    expect(scoreGenPupM(Array(24).fill(0))).toEqual({ total: 0, band: "none" });
    const mild = Array(24).fill(0);
    mild[0] = 30;
    expect(scoreGenPupM(mild)).toEqual({ total: 30, band: "mild" });
  });

  it("respects band boundaries", () => {
    expect(bandFor(27)).toBe("none");
    expect(bandFor(28)).toBe("mild");
    expect(bandFor(82)).toBe("moderate");
    expect(bandFor(83)).toBe("severe");
  });

  it("rejects the wrong number of items", () => {
    expect(() => scoreGenPupM([1, 2, 3])).toThrow(/expects 24/);
  });

  it("rejects an out-of-range total", () => {
    const bad = Array(24).fill(0);
    bad[0] = 200;
    expect(() => scoreGenPupM(bad)).toThrow(/out of range/);
  });

  it("flags MCID crossings and direction vs baseline", () => {
    expect(crossedMcid(40, 30)).toBe(true); // delta 10 >= 8
    expect(crossedMcid(35, 30)).toBe(false); // delta 5 < 8
    expect(changeDirection(40, 30)).toBe("worse");
    expect(changeDirection(20, 30)).toBe("better");
    expect(changeDirection(30, 30)).toBe("stable");
  });
});
