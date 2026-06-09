/** The standard white surface used for every section on the Goldvale screens. */
import type { CSSProperties, ReactNode } from "react";
import { C } from "./tokens";

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: C.card,
        borderRadius: "var(--radius)",
        border: `1px solid ${C.hair}`,
        boxShadow: "0 1px 2px rgba(32,38,42,0.04), 0 10px 26px rgba(32,38,42,0.05)",
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
