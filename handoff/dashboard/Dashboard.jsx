// Goldvale — Dashboard (mobile). The longitudinal mobility story.
// Grounded in lib/domain/mobility.ts (GenPup-M 0–108, higher=worse, bands,
// MCID=8 vs own baseline), progression.ts (6 clean sessions ≥14d → vet nudge,
// phrased as a question), seed-data.ts (TPLO phases, exercises), guardrails.
// Non-clinical: trends vs the pet's OWN baseline, never a diagnosis.

const { useState, useEffect, useRef } = React;

// ── tokens ──────────────────────────────────────────────────────────────────
const C = {
  cream: '#eef1ef', charcoal: '#20262a', gold: '#d6981e', sage: '#4f8a7d',
  danger: '#c0492b', muted: '#687069', mutedSoft: '#8a938e', card: '#ffffff',
  hair: '#dde3df', hairSoft: '#e8ece9', field: '#f2f5f3',
};
const A = {
  mob:   { c: '#4f8a7d', soft: 'var(--sage-soft)' },
  qol:   { c: '#5b7a99', soft: 'var(--slate-soft)' },
  rehab: { c: '#3f8f86', soft: 'var(--teal-soft)' },
  recov: { c: '#7d6b96', soft: 'var(--plum-soft)' },
  brief: { c: '#b3654a', soft: 'var(--clay-soft)' },
};

// ── icons ────────────────────────────────────────────────────────────────────
const Ico = {
  heart: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none" stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  trend: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none" stroke={p.c || 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 17 13.5 8.5l-5 5L2 7" /><path d="M16 17h6v-6" />
    </svg>
  ),
  activity: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none" stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  sparkles: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none" stroke={p.c || 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M5 12H3M21 12h-2M6.3 6.3 7.7 7.7M16.3 16.3l1.4 1.4M6.3 17.7 7.7 16.3M16.3 7.7l1.4-1.4" />
    </svg>
  ),
  chevR: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none" stroke={p.c || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  cal: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none" stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  file: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none" stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 13h6M9 17h4" />
    </svg>
  ),
  check: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  paw: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none" stroke={p.c || 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="4" cy="8" r="2" /><circle cx="7.5" cy="15" r="2" />
      <path d="M14.5 15c2.5 0 4 2 4 4a3 3 0 0 1-3 3c-1.2 0-2-.5-3.5-.5s-2.3.5-3.5.5a3 3 0 0 1-3-3c0-2 1.5-4 4-4 .8 0 1.5.3 2.5.3s1.7-.3 2.5-.3Z" />
    </svg>
  ),
};

// ── QoL face glyph (matches check-in) ────────────────────────────────────────
function Face({ level, size = 26, stroke = '#7e8884', sw = 1.7 }) {
  const cy = 27 + (level - 2) * 4.6;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="21" stroke={stroke} strokeWidth={sw} />
      <circle cx="17.5" cy="20.5" r="1.9" fill={stroke} />
      <circle cx="30.5" cy="20.5" r="1.9" fill={stroke} />
      <path d={`M15.5 29 Q24 ${cy} 32.5 29`} stroke={stroke} strokeWidth={sw} strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── shared shells ─────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      background: C.card, borderRadius: 'var(--radius)', border: `1px solid ${C.hair}`,
      boxShadow: '0 1px 2px rgba(32,38,42,0.04), 0 10px 26px rgba(32,38,42,0.05)',
      padding: 16, ...style,
    }}>{children}</div>
  );
}
function SectionHead({ icon, accent, title, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 13 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 11, flexShrink: 0,
        background: accent.soft, color: accent.c,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 500, letterSpacing: -0.2 }}>{title}</div>
      {hint && <div style={{ fontSize: 11.5, color: C.muted, display: 'flex', alignItems: 'center', gap: 4, fontVariantNumeric: 'tabular-nums', flexShrink: 0, whiteSpace: 'nowrap' }}>{hint}</div>}
    </div>
  );
}

// ── data (grounded) ───────────────────────────────────────────────────────────
// GenPup-M weekly totals, higher = worse. Baseline 4 wks ago = 42, now 34 → -8 (crosses MCID).
const MOB_SERIES = [
  { w: 'Wk 1', v: 48 }, { w: 'Wk 2', v: 45 }, { w: 'Wk 3', v: 42 },
  { w: 'Wk 4', v: 39 }, { w: 'Wk 5', v: 36 }, { w: 'Now', v: 34 },
];
const BASELINE = 42;        // pet's own baseline (4 weeks ago)
const CURRENT = 34;
const MCID = 8;             // mobility.ts
// band for 34 = mild (28–54)
const QOL_WEEK = [2, 3, 3, 1, 2, 3, 3]; // last 7 days, 0..4
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const CLEAN_SESSIONS = 6;   // progression.ts minCleanSessions
const SPAN_DAYS = 18;       // ≥ 14

// ── hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', borderRadius: 22, marginBottom: 16,
      background: 'linear-gradient(150deg, #4f8a7d 0%, #46796f 42%, #50708a 100%)',
      boxShadow: '0 14px 30px rgba(58,107,96,0.26)', padding: '17px 17px 16px',
    }}>
      <svg width="190" height="190" viewBox="0 0 190 190" style={{ position: 'absolute', top: -54, right: -46, opacity: 0.16 }}>
        <circle cx="95" cy="95" r="78" fill="none" stroke="#fff" strokeWidth="1.4" />
        <circle cx="95" cy="95" r="56" fill="none" stroke="#fff" strokeWidth="1.4" />
        <circle cx="95" cy="95" r="34" fill="none" stroke="#fff" strokeWidth="1.4" />
      </svg>
      <svg width="120" height="60" viewBox="0 0 120 60" style={{ position: 'absolute', bottom: -8, left: -10, opacity: 0.14 }}>
        <path d="M2 50 Q30 6 60 30 T118 18" fill="none" stroke="#fff" strokeWidth="1.4" />
      </svg>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{ width: 58, height: 58, borderRadius: 999, flexShrink: 0, padding: 3, background: 'rgba(255,255,255,0.22)', boxShadow: '0 4px 12px rgba(0,0,0,0.14)' }}>
          <img src="assets/oscar.jpg" alt="Oscar" style={{ width: '52px', height: '52px', borderRadius: '999px', objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.78)', fontWeight: 600, letterSpacing: 0.3 }}>Oscar · 12 yr · Toy poodle</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 23, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.05, marginTop: 2, color: '#fff', whiteSpace: 'nowrap' }}>
            How Oscar’s doing
          </div>
        </div>
        <div style={{ alignSelf: 'flex-start', fontSize: 10.5, color: '#fff', fontWeight: 650, background: 'rgba(255,255,255,0.18)', padding: '5px 9px', borderRadius: 999, whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.22)' }}>Week 5 · post-op</div>
      </div>

      <div style={{ position: 'relative', display: 'flex', gap: 9, marginTop: 14 }}>
        {[
          { k: '34-day', l: 'check-in streak' },
          { k: 'Mild', l: 'mobility band' },
          { k: 'Jun 18', l: 'next vet visit' },
        ].map((s) => (
          <div key={s.l} style={{ flex: 1, background: 'rgba(255,255,255,0.13)', borderRadius: 13, padding: '9px 10px', border: '1px solid rgba(255,255,255,0.16)' }}>
            <div style={{ fontSize: 15, fontWeight: 750, color: '#fff', letterSpacing: -0.2, fontVariantNumeric: 'tabular-nums' }}>{s.k}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 1, lineHeight: 1.15 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── mobility score chart (the centerpiece) ───────────────────────────────────
function MobilityCard() {
  const W = 300, H = 116, padX = 6, padTop = 12, padBot = 22;
  const vals = MOB_SERIES.map((d) => d.v);
  const lo = Math.min(...vals) - 4, hi = Math.max(...vals) + 4;
  const x = (i) => padX + (i * (W - padX * 2)) / (MOB_SERIES.length - 1);
  const y = (v) => padTop + ((hi - v) / (hi - lo)) * (H - padTop - padBot);
  const pts = MOB_SERIES.map((d, i) => [x(i), y(d.v)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${x(MOB_SERIES.length - 1).toFixed(1)} ${H - padBot} L${padX} ${H - padBot} Z`;
  const last = pts[pts.length - 1];
  const baseY = y(BASELINE);

  const lineRef = useRef(null);
  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = len;
    el.style.strokeDashoffset = len;
    el.getBoundingClientRect();
    el.style.transition = 'stroke-dashoffset 1s ease-out';
    requestAnimationFrame(() => { el.style.strokeDashoffset = '0'; });
  }, []);

  return (
    <Card>
      <SectionHead icon={Ico.trend({ s: 18, c: A.mob.c })} accent={A.mob} title="Mobility trend" hint="GenPup-M · 24 items" />

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 4 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 500, lineHeight: 1, letterSpacing: -1 }}>{CURRENT}</span>
            <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>/ 108</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, background: 'var(--sage-soft)', color: 'var(--sage-ink)', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
            {Ico.trend({ s: 13, c: 'var(--sage-ink)' })} {BASELINE - CURRENT} better than baseline
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Band</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal }}>Mild</div>
        </div>
      </div>

      {/* chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', marginTop: 8, overflow: 'visible' }}>
        <defs>
          <linearGradient id="mobFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={A.mob.c} stopOpacity="0.18" />
            <stop offset="100%" stopColor={A.mob.c} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* baseline reference */}
        <line x1={padX} y1={baseY} x2={W - padX} y2={baseY} stroke={C.muted} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        <text x={W - padX} y={baseY - 5} textAnchor="end" fontSize="9.5" fill={C.muted} fontWeight="600">baseline {BASELINE}</text>
        <path d={area} fill="url(#mobFill)" />
        <path ref={lineRef} className="gv-line" d={line} fill="none" stroke={A.mob.c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4.5 : 2.6} fill={i === pts.length - 1 ? A.mob.c : '#fff'} stroke={A.mob.c} strokeWidth="1.8" />
        ))}
        {MOB_SERIES.map((d, i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9.5" fill={C.mutedSoft} fontWeight="600">{d.w}</text>
        ))}
      </svg>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 12, paddingTop: 13, borderTop: `1px solid ${C.hairSoft}` }}>
        <span style={{ color: A.mob.c, flexShrink: 0, marginTop: 1 }}>{Ico.sparkles({ s: 14, c: A.mob.c })}</span>
        <div style={{ fontSize: 12.5, color: '#4a544f', lineHeight: 1.45 }}>
          An <strong style={{ color: C.charcoal, fontWeight: 700 }}>{BASELINE - CURRENT}-point</strong> improvement vs Oscar’s own baseline — past the {MCID}-point mark Goldvale treats as meaningful. Worth mentioning at your next visit, not a diagnosis.
        </div>
      </div>
    </Card>
  );
}

// ── QoL week strip ────────────────────────────────────────────────────────────
function QolWeekCard() {
  const labels = ['Hard', 'Low', 'Okay', 'Good', 'Bright'];
  return (
    <Card>
      <SectionHead icon={Ico.heart({ s: 18, c: A.qol.c })} accent={A.qol} title="The week in mood" hint="last 7 days" />
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
        {QOL_WEEK.map((lv, i) => {
          const today = i === QOL_WEEK.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: today ? A.qol.soft : C.field,
                boxShadow: today ? `0 0 0 2px ${A.qol.c}` : 'none',
              }}>
                <Face level={lv} size={26} stroke={today ? C.charcoal : '#9aa39d'} sw={1.7} />
              </div>
              <div style={{ fontSize: 10, color: today ? C.charcoal : C.muted, fontWeight: today ? 700 : 600 }}>{DOW[i]}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 13, lineHeight: 1.45 }}>
        Mostly good days, with one low on Thursday. Oscar has held steady this week.
      </div>
    </Card>
  );
}

// ── progression nudge (question-framed) ──────────────────────────────────────
function ProgressionCard() {
  return (
    <Card style={{ background: 'linear-gradient(165deg, #ffffff, #f4f9f7)', borderColor: 'rgba(63,143,134,0.28)' }}>
      <SectionHead icon={Ico.activity({ s: 18, c: A.rehab.c })} accent={A.rehab} title="A gentle milestone" />
      <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, letterSpacing: -0.1 }}>
        Oscar has had <span style={{ color: A.rehab.c, fontWeight: 750 }}>{CLEAN_SESSIONS} clean rehab sessions</span> over {SPAN_DAYS} days.
      </div>
      {/* session dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 13 }}>
        {Array.from({ length: CLEAN_SESSIONS }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 7, borderRadius: 999, background: A.rehab.c, opacity: 0.4 + (i / CLEAN_SESSIONS) * 0.55 }} />
        ))}
      </div>
      <div style={{ fontSize: 12.5, color: '#4a544f', lineHeight: 1.45, marginTop: 13 }}>
        That can be a sign she’s ready for a little more. It’s your vet’s call — want to raise it with Dr. Okafor?
      </div>
      <button className="gv-press" style={{
        width: '100%', marginTop: 14, padding: '12px', borderRadius: 13, cursor: 'pointer',
        border: `1px solid ${A.rehab.c}`, background: 'var(--teal-soft)', color: '#2f6a62',
        fontSize: 14, fontWeight: 650, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        Add to vet brief {Ico.chevR({ s: 16, c: '#2f6a62' })}
      </button>
    </Card>
  );
}

// ── pattern memory (consistent with check-in) ────────────────────────────────
function PatternCard() {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}>
        <span style={{ display: 'flex', color: C.sage }}>{Ico.sparkles({ s: 15, c: C.sage })}</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: C.sage }}>Pattern memory</span>
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 17.5, fontWeight: 500, lineHeight: 1.36, letterSpacing: -0.1 }}>
        Slower rising has shown up <span style={{ fontStyle: 'italic', fontWeight: 600 }}>3 times in 2 weeks</span>.
      </div>
      <div style={{ display: 'flex', gap: 7, marginTop: 14 }}>
        {[{ d: 'May 22', h: 16 }, { d: 'May 30', h: 22 }, { d: 'Jun 4', h: 27 }].map((x) => (
          <div key={x.d} style={{ flex: 1, background: C.field, border: `1px solid ${C.hairSoft}`, borderRadius: 12, padding: '9px 8px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: 28 }}>
              <div style={{ width: 7, height: x.h, borderRadius: 3, background: C.sage, opacity: 0.55 }} />
            </div>
            <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{x.d}</div>
          </div>
        ))}
      </div>
      <button className="gv-press" style={{
        width: '100%', marginTop: 14, padding: '11px', borderRadius: 12, cursor: 'pointer',
        border: `1px solid ${C.hair}`, background: '#fff', color: C.charcoal,
        fontSize: 13.5, fontWeight: 650, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        See how those days went {Ico.chevR({ s: 15, c: C.charcoal })}
      </button>
    </Card>
  );
}

// ── recovery timeline (TPLO phases) ──────────────────────────────────────────
function RecoveryCard() {
  const phases = [
    { wk: '0–2', label: 'Strict rest · 5-min leash walks', done: true },
    { wk: '2–4', label: 'Add weight shifts & sit-to-stand', done: true },
    { wk: '4–8', label: 'Build to 15–20 min walks', now: true },
    { wk: '8', label: 'Radiograph gates off-leash', milestone: true },
  ];
  return (
    <Card>
      <SectionHead icon={Ico.cal({ s: 17, c: A.recov.c })} accent={A.recov} title="Recovery plan" hint="TPLO post-op" />
      <div style={{ position: 'relative', paddingLeft: 6 }}>
        {phases.map((p, i) => {
          const isLast = i === phases.length - 1;
          const dot = p.now ? A.recov.c : p.done ? A.recov.c : p.milestone ? C.gold : C.hair;
          return (
            <div key={i} style={{ display: 'flex', gap: 13, position: 'relative', paddingBottom: isLast ? 0 : 16 }}>
              {!isLast && <div style={{ position: 'absolute', left: 7, top: 16, bottom: 0, width: 2, background: p.done ? A.recov.c : C.hair, opacity: p.done ? 0.4 : 1 }} />}
              <div style={{ flexShrink: 0, width: 16, height: 16, borderRadius: 999, marginTop: 1, background: p.done || p.now ? dot : '#fff', border: `2px solid ${dot}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: p.now ? `0 0 0 4px var(--plum-soft)` : 'none' }}>
                {p.done && Ico.check({ s: 10, c: '#fff', w: 3 })}
                {p.milestone && <span style={{ width: 5, height: 5, borderRadius: 999, background: C.gold }} />}
              </div>
              <div style={{ flex: 1, paddingBottom: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: p.now ? A.recov.c : C.charcoal, fontVariantNumeric: 'tabular-nums' }}>Week {p.wk}</span>
                  {p.now && <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: A.recov.c, background: 'var(--plum-soft)', padding: '2px 7px', borderRadius: 999 }}>You are here</span>}
                  {p.milestone && <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: C.gold, background: 'var(--gold-soft)', padding: '2px 7px', borderRadius: 999 }}>Milestone</span>}
                </div>
                <div style={{ fontSize: 12.5, color: p.done ? C.muted : '#4a544f', marginTop: 2, lineHeight: 1.35 }}>{p.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── vet brief CTA ─────────────────────────────────────────────────────────────
function VetBriefCard() {
  return (
    <button className="gv-press" style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      background: 'linear-gradient(150deg, #b3654a, #9c5238)', border: 'none',
      borderRadius: 'var(--radius)', padding: 16, color: '#fff',
      boxShadow: '0 10px 24px rgba(156,82,56,0.26)',
      display: 'flex', alignItems: 'center', gap: 13,
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {Ico.file({ s: 20, c: '#fff' })}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 500 }}>Prepare a vet brief</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>For Oscar’s visit on June 18 · 3 things to mention</div>
      </div>
      {Ico.chevR({ s: 18, c: '#fff' })}
    </button>
  );
}

// ── vet line (bounded danger) ────────────────────────────────────────────────
function VetLine() {
  return (
    <div style={{ textAlign: 'center', fontSize: 12, color: C.muted, padding: '6px 0 2px', lineHeight: 1.5 }}>
      Noticed something worrying?{' '}
      <span style={{ color: C.danger, fontWeight: 650, textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer' }}>
        Contact your vet now
      </span>
    </div>
  );
}

// ── app ───────────────────────────────────────────────────────────────────────
function DashboardApp() {
  return (
    <IOSDevice>
      <div className="gv-scroll" style={{ height: '100%', overflowY: 'auto', background: C.cream, padding: '60px 16px 26px' }}>
        <Hero />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MobilityCard />
          <QolWeekCard />
          <ProgressionCard />
          <PatternCard />
          <RecoveryCard />
          <VetBriefCard />
          <VetLine />
          <div style={{ height: 6 }} />
        </div>
      </div>
    </IOSDevice>
  );
}

window.DashboardApp = DashboardApp;
