"use client";

/**
 * The mobility trend chart — the dashboard centerpiece. Draws the GenPup-M line
 * (0–108, higher = worse) against the pet's own dashed baseline, animating the
 * stroke on mount (honours prefers-reduced-motion). Every figure is precomputed
 * by lib/domain upstream; this component only draws.
 */
import { useEffect, useRef } from "react";
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
  const y = (v: number) => padTop + ((hi - v) / (hi - lo)) * (H - padTop - padBot);
  const pts = series.map((d, i) => [x(i), y(d.value)] as const);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${x(series.length - 1).toFixed(1)} ${H - padBot} L${padX} ${H - padBot} Z`;
  const baseY = y(baseline);

  const lineRef = useRef<SVGPathElement>(null);
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

  return (
    <Card>
      <SectionHead icon={Ico.trend({ s: 18, c: ACCENT.c })} accent={ACCENT} title="Mobility trend" hint="GenPup-M · 24 items" />

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
            {Ico.trend({ s: 13, c: "var(--sage-ink)" })} {improvement} better than baseline
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Band</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal }}>{bandLabel}</div>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", marginTop: 8, overflow: "visible" }}>
        <defs>
          <linearGradient id="mobFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT.c} stopOpacity="0.18" />
            <stop offset="100%" stopColor={ACCENT.c} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={padX} y1={baseY} x2={W - padX} y2={baseY} stroke={C.muted} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        <text x={W - padX} y={baseY - 5} textAnchor="end" fontSize="9.5" fill={C.muted} fontWeight="600">
          baseline {baseline}
        </text>
        <path d={area} fill="url(#mobFill)" />
        <path ref={lineRef} d={line} fill="none" stroke={ACCENT.c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p[0]}
            cy={p[1]}
            r={i === pts.length - 1 ? 4.5 : 2.6}
            fill={i === pts.length - 1 ? ACCENT.c : "#fff"}
            stroke={ACCENT.c}
            strokeWidth="1.8"
          />
        ))}
        {series.map((d, i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9.5" fill={C.mutedSoft} fontWeight="600">
            {d.label}
          </text>
        ))}
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
          An <strong style={{ color: C.charcoal, fontWeight: 700 }}>{improvement}-point</strong> improvement vs the pet&rsquo;s own
          baseline — past the {mcid}-point mark Goldvale treats as meaningful. Worth mentioning at your next visit, not a diagnosis.
        </div>
      </div>
    </Card>
  );
}
