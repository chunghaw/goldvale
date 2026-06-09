/**
 * The sage→slate gradient hero shared by all three screens: avatar, eyebrow,
 * serif title, a top-right badge, and a slot for the bottom row (stat tiles on the
 * dashboard/brief, a consolation banner on the check-in).
 */
import Image from "next/image";
import type { ReactNode } from "react";

export function Hero({
  avatarSrc,
  avatarAlt,
  eyebrow,
  title,
  badge,
  children,
}: {
  avatarSrc: string;
  avatarAlt: string;
  eyebrow: string;
  title: ReactNode;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 22,
        marginBottom: 16,
        background: "linear-gradient(150deg, #4f8a7d 0%, #46796f 42%, #50708a 100%)",
        boxShadow: "0 14px 30px rgba(58,107,96,0.26)",
        padding: "17px 17px 16px",
      }}
    >
      {/* soft botanical arcs */}
      <svg
        width="190"
        height="190"
        viewBox="0 0 190 190"
        style={{ position: "absolute", top: -54, right: -46, opacity: 0.16 }}
      >
        <circle cx="95" cy="95" r="78" fill="none" stroke="#fff" strokeWidth="1.4" />
        <circle cx="95" cy="95" r="56" fill="none" stroke="#fff" strokeWidth="1.4" />
        <circle cx="95" cy="95" r="34" fill="none" stroke="#fff" strokeWidth="1.4" />
      </svg>
      <svg
        width="120"
        height="60"
        viewBox="0 0 120 60"
        style={{ position: "absolute", bottom: -8, left: -10, opacity: 0.14 }}
      >
        <path d="M2 50 Q30 6 60 30 T118 18" fill="none" stroke="#fff" strokeWidth="1.4" />
      </svg>

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 13 }}>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 999,
            flexShrink: 0,
            padding: 3,
            background: "rgba(255,255,255,0.22)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.14)",
          }}
        >
          <Image
            src={avatarSrc}
            alt={avatarAlt}
            width={52}
            height={52}
            style={{ width: 52, height: 52, borderRadius: 999, objectFit: "cover", display: "block" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.78)", fontWeight: 600, letterSpacing: 0.3 }}>
            {eyebrow}
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: 23,
              fontWeight: 500,
              letterSpacing: -0.3,
              lineHeight: 1.05,
              marginTop: 2,
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </div>
        </div>
        {badge && (
          <div
            style={{
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 10.5,
              color: "#fff",
              fontWeight: 650,
              background: "rgba(255,255,255,0.18)",
              padding: "5px 9px",
              borderRadius: 999,
              whiteSpace: "nowrap",
              border: "1px solid rgba(255,255,255,0.22)",
            }}
          >
            {badge}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}

/** The translucent stat tiles used in the dashboard/brief hero bottom rows. */
export function HeroStats({ stats }: { stats: { k: ReactNode; l: string }[] }) {
  return (
    <div style={{ position: "relative", display: "flex", gap: 9, marginTop: 14 }}>
      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.13)",
            borderRadius: 13,
            padding: "9px 10px",
            border: "1px solid rgba(255,255,255,0.16)",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 750,
              color: "#fff",
              letterSpacing: -0.2,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {s.k}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 1, lineHeight: 1.15 }}>
            {s.l}
          </div>
        </div>
      ))}
    </div>
  );
}
