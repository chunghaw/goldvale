/**
 * Shared design tokens for the Goldvale screens — the cooled, higher-contrast
 * reading of app/globals.css the mocks were tuned against (handoff/README.md).
 *
 * Hex literals here mirror the CSS custom properties in globals.css; the soft/ink
 * tints are referenced through `var(--*)` so a future warm⇄cool token swap is a
 * one-file change in globals.css.
 */

/** Core palette (cool charcoal / cream / hairlines / fields). */
export const C = {
  cream: "#eef1ef",
  charcoal: "#20262a",
  gold: "#d6981e",
  sage: "#4f8a7d",
  danger: "#c0492b",
  muted: "#687069",
  mutedSoft: "#8a938e",
  card: "#ffffff",
  hair: "#dde3df",
  hairSoft: "#e8ece9",
  field: "#f2f5f3",
} as const;

/** A per-section accent: a saturated `c` paired with a faint `soft` tint. */
export interface Accent {
  c: string;
  soft: string;
}

/** Muted per-section accent family — life without brightness. */
export const A = {
  sage: { c: "#4f8a7d", soft: "var(--sage-soft)" },
  slate: { c: "#5b7a99", soft: "var(--slate-soft)" },
  teal: { c: "#3f8f86", soft: "var(--teal-soft)" },
  plum: { c: "#7d6b96", soft: "var(--plum-soft)" },
  clay: { c: "#b3654a", soft: "var(--clay-soft)" },
} as const satisfies Record<string, Accent>;
