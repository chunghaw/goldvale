import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(__dirname, "..", "..", "app", "globals.css"), "utf8");

/** WCAG relative-luminance pair-contrast — pure helpers so the test doesn't read tokens twice. */
function lum(hex: string): number {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16) / 255;
  const g = parseInt(v.slice(2, 4), 16) / 255;
  const b = parseInt(v.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a: string, b: string): number {
  const la = lum(a), lb = lum(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function tokenFromCss(name: string): string {
  const m = css.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token ${name} not found`);
  return m[1];
}

describe("WCAG contrast — secondary text must clear AA on its backgrounds", () => {
  const muted = tokenFromCss("--muted");
  const field = tokenFromCss("--field");
  const card = tokenFromCss("--card");
  const background = tokenFromCss("--background");

  it("--muted is the darkened token introduced in P4 #13", () => {
    // intentional choice — lock the exact value so future styling can't quietly regress
    expect(muted).toBe("#5a6359");
  });

  it("--muted clears WCAG AA on --field (the field-tinted surface)", () => {
    expect(contrast(muted, field)).toBeGreaterThanOrEqual(4.5);
  });

  it("--muted clears WCAG AA on --card (white cards)", () => {
    expect(contrast(muted, card)).toBeGreaterThanOrEqual(4.5);
  });

  it("--muted clears WCAG AA on --background (cooled cream)", () => {
    expect(contrast(muted, background)).toBeGreaterThanOrEqual(4.5);
  });
});
