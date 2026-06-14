"use client";

/**
 * The mobility trend chart — the dashboard centerpiece. Draws the GenPup-M line
 * (0–108, higher = worse) against the pet's own dashed baseline, animating the
 * stroke on mount (honours prefers-reduced-motion). Every figure is precomputed
 * by lib/domain upstream; this component only draws.
 */
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { SectionHead } from "@/components/ui/SectionHead";
import { Ico } from "@/components/ui/icons";
import { A, C } from "@/components/ui/tokens";
import type { MobilityTrend } from "@/lib/data/view";

const ACCENT = A.sage;

export function MobilityChart({ trend, bandLabel }: { trend: MobilityTrend; bandLabel: string }) {
  const { series, baseline, current, mcid, improvement } = trend;
  const W = 300,
    H = 116,
    padX = 6,
    padTop = 12,
    padBot = 22;
  const vals = series.map((d) => d.value);
  const lo = Math.min(...vals) - 4,
    hi = Math.max(...vals) + 4;
  const x = (i: number) => padX + (i * (W - padX * 2)) / (series.length - 1);
  // y is INVERTED vs the raw score: GenPup-M is higher = worse, so we plot a lower
  // (better) score HIGHER on the chart — improvement rises, worsening falls.
  const y = (v: number) => padTop + ((v - lo) / (hi - lo)) * (H - padTop - padBot);
  const pts = series.map((d, i) => [x(i), y(d.value)] as const);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${x(series.length - 1).toFixed(1)} ${H - padBot} L${padX} ${H - padBot} Z`;
  const baseY = y(baseline);

  const lineRef = useRef<SVGPathElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    el.getBoundingClientRect();
    el.style.transition = "stroke-dashoffset 1s ease-out";
    requestAnimationFrame(() => {
      el.style.strokeDashoffset = "0";
    });
  }, []);

  if (series.length < 2) {
    return (
      <Card>
        <SectionHead icon={Ico.trendUp({ s: 18, c: ACCENT.c })} accent={ACCENT} title="Mobility trend" hint="GenPup-M" />
        <div style={{ padding: "18px 6px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5, maxWidth: 264, margin: "0 auto" }}>
            {series.length === 1
              ? `First GenPup-M score logged: ${current}/108. The trend appears once there's a second to compare.`
              : "Your mobility trend will appear here — Goldvale charts each GenPup-M check-in against the pet's own baseline."}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <SectionHead icon={Ico.trendUp({ s: 18, c: ACCENT.c })} accent={ACCENT} title="Mobility trend" hint="GenPup-M · 24 items" />

      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 4 }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: "var(--serif)", fontSize: 40, fontWeight: 500, lineHeight: 1, letterSpacing: -1 }}>
              {current}
            </span>
            <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>/ 108</span>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              marginTop: 8,
              background: "var(--sage-soft)",
              color: "var(--sage-ink)",
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            {Ico.trendUp({ s: 13, c: "var(--sage-ink)" })} {improvement} better than baseline
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Band</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal }}>{bandLabel}</div>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", marginTop: 8, overflow: "visible" }} onClick={() => setActiveIdx(null)}>
        <defs>
          <linearGradient id="mobFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT.c} stopOpacity="0.18" />
            <stop offset="100%" stopColor={ACCENT.c} stopOpacity="0" />
          </linearGradient>
        </defs>
        <text x={padX} y={padTop + 1} fontSize="9" fill={ACCENT.c} fontWeight="700">↑ better</text>
        <line x1={padX} y1={baseY} x2={W - padX} y2={baseY} stroke={C.muted} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        <text x={W - padX} y={baseY - 5} textAnchor="end" fontSize="9.5" fill={C.muted} fontWeight="600">
          baseline {baseline}
        </text>
        <path d={area} fill="url(#mobFill)" />
        <path ref={lineRef} d={line} fill="none" stroke={ACCENT.c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => {
          const isActive = activeIdx === i;
          const isLast = i === pts.length - 1;
          return (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={isActive ? 5.5 : isLast ? 4.5 : 2.6} fill={isActive || isLast ? ACCENT.c : "#fff"} stroke={ACCENT.c} strokeWidth="1.8" />
              <circle cx={p[0]} cy={p[1]} r={13} fill="transparent" style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setActiveIdx(isActive ? null : i); }} />
            </g>
          );
        })}
        {series.map((d, i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9.5" fill={activeIdx === i ? ACCENT.c : C.mutedSoft} fontWeight={activeIdx === i ? 700 : 600}>
            {d.label}
          </text>
        ))}
        {activeIdx !== null && (() => {
          const p = pts[activeIdx];
          const d = series[activeIdx];
          const tw = 50, th = 28;
          const tx = Math.min(Math.max(p[0] - tw / 2, padX), W - padX - tw);
          const above = p[1] - th - 9 >= padTop;
          const ty = above ? p[1] - th - 9 : p[1] + 9;
          return (
            <g pointerEvents="none">
              <rect x={tx} y={ty} width={tw} height={th} rx={7} fill={C.charcoal} />
              <text x={tx + tw / 2} y={ty + 13} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fff">{d.value}<tspan fontSize="8" fillOpacity="0.65"> /108</tspan></text>
              <text x={tx + tw / 2} y={ty + 22} textAnchor="middle" fontSize="8" fill="#fff" fillOpacity="0.7">{d.label}</text>
            </g>
          );
        })()}
      </svg>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
          marginTop: 12,
          paddingTop: 13,
          borderTop: `1px solid ${C.hairSoft}`,
        }}
      >
        <span style={{ color: ACCENT.c, flexShrink: 0, marginTop: 1 }}>{Ico.sparkles({ s: 14, c: ACCENT.c })}</span>
        <div style={{ fontSize: 12.5, color: "#4a544f", lineHeight: 1.45 }}>
          An <strong style={{ color: C.charcoal, fontWeight: 700 }}>{improvement}-point</strong>{" "}improvement vs the pet&rsquo;s own
          baseline — past the {mcid}-point mark Goldvale treats as meaningful. Worth mentioning at your next visit, not a diagnosis.
        </div>
      </div>
    </Card>
  );
}
