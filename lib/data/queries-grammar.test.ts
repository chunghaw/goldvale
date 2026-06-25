import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const src = readFileSync(join(__dirname, "queries.ts"), "utf8");

/**
 * Lock the singularization of pattern-memory copy: "1 time in 1 week" must
 * never regress to "1 times in 1 weeks", and the brief-mention title equally.
 */
describe("queries.ts — copy grammar locks", () => {
  it("patternFromCheckins emphasis singularizes 'time' / 'times'", () => {
    expect(src).toMatch(/n === 1 \? "time" : "times"/);
  });

  it("brief mention title singularizes 'time' / 'times'", () => {
    expect(src).toMatch(/d\.pattern\.occurrences\.length === 1 \? "time" : "times"/);
  });
});
