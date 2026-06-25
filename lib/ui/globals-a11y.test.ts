import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(__dirname, "..", "..", "app", "globals.css"), "utf8");
const flat = css.replace(/\s+/g, " ");

/**
 * Lock the keyboard-focus rules in app/globals.css. The QoL faces, mobility
 * options, rep counters and icon-only buttons all rely on a global
 * :focus-visible ring — without it, keyboard users have nothing to anchor to.
 */
describe("app/globals.css — keyboard focus visibility", () => {
  it("declares a :focus-visible outline coloured with --sage", () => {
    expect(flat).toMatch(/:focus-visible\s*\{[^}]*outline:\s*[^;]*var\(--sage\)[^}]*\}/);
  });

  it("offsets the focus ring so it reads on both light cards and tinted surfaces", () => {
    expect(flat).toMatch(/:focus-visible\s*\{[^}]*outline-offset:\s*\d+px/);
  });

  it("opts the note textarea out of the global ring (it has its own border focus)", () => {
    expect(flat).toMatch(/textarea\.gv-note:focus-visible\s*\{\s*outline:\s*none/);
  });
});
