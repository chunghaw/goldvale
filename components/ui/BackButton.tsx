/**
 * The shared back/exit control. Every pet sub-screen places one top-left so there is
 * always a clear way back to the dashboard. Two variants: `light` for the coloured
 * gradient headers (white chevron), default for plain/cream backgrounds.
 */
import Link from "next/link";
import { Ico } from "./icons";
import { C } from "./tokens";

export function BackButton({
  href,
  label = "Back",
  light = false,
}: {
  href: string;
  label?: string;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="gv-press"
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        border: light ? "1px solid rgba(255,255,255,0.32)" : `1px solid ${C.hair}`,
        background: light ? "rgba(255,255,255,0.16)" : "#fff",
      }}
    >
      {Ico.chevL({ s: 17, c: light ? "#fff" : C.charcoal })}
    </Link>
  );
}
