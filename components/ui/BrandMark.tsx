/**
 * Oscar brand mark — a four-toe paw whose pad is a heart ("a calmer way to care",
 * in memory of Oscar). Sage toes + gold heart by default; pass a matching `toe`/`heart`
 * for a single-colour silhouette on dark or photographic backgrounds.
 */
import type { JSX } from "react";

export interface BrandMarkProps {
  /** square size in px (default 24) */
  size?: number;
  /** toe-bean fill (default brand sage) */
  toe?: string;
  /** heart-pad fill (default brand gold) */
  heart?: string;
  /** accessible label; omit to render the mark as decorative */
  title?: string;
}

export function BrandMark({
  size = 24,
  toe = "#4f8a7d",
  heart = "#d6981e",
  title,
}: BrandMarkProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 92 92"
      fill="none"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <ellipse cx="20" cy="36" rx="6.4" ry="8.4" fill={toe} transform="rotate(-24 20 36)" />
      <ellipse cx="35" cy="24" rx="7" ry="9" fill={toe} transform="rotate(-8 35 24)" />
      <ellipse cx="57" cy="24" rx="7" ry="9" fill={toe} transform="rotate(8 57 24)" />
      <ellipse cx="72" cy="36" rx="6.4" ry="8.4" fill={toe} transform="rotate(24 72 36)" />
      <path
        d="M46 80 C 30 66 22 57 22 49 C 22 43 27 40 32 41 C 37 42 44 47 46 52 C 48 47 55 42 60 41 C 65 40 70 43 70 49 C 70 57 62 66 46 80 Z"
        fill={heart}
      />
    </svg>
  );
}
