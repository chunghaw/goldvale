/** Coloured icon tile + serif title (+ optional right-aligned hint) for a section. */
import type { ReactNode } from "react";
import { C, type Accent } from "./tokens";

export function SectionHead({
  icon,
  accent,
  title,
  hint,
}: {
  icon: ReactNode;
  accent: Accent;
  title: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 13 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 11,
          flexShrink: 0,
          background: accent.soft,
          color: accent.c,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontFamily: "var(--serif)",
          fontSize: 19,
          fontWeight: 500,
          letterSpacing: -0.2,
        }}
      >
        {title}
      </div>
      {hint && (
        <div
          style={{
            fontSize: 11.5,
            color: C.muted,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontVariantNumeric: "tabular-nums",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
