// Oscar — Daily check-in (mobile). Brand tokens from app/globals.css.
// Fields grounded in lib/db/schema.ts + lib/domain/*: qolScore (HHHHHMM 5-face),
// mobilityItems (rotating GenPup-M items), tolerance enum (handled/a_bit_tired/
// sore/refused), medication_events, journal note. Insight = pgvector recall.

const { useState } = React;

// ── tokens ──────────────────────────────────────────────────────────────────
const C = {
  cream: '#eef1ef', charcoal: '#20262a', gold: '#d6981e', sage: '#4f8a7d',
  danger: '#c0492b', muted: '#687069', mutedSoft: '#8a938e', card: '#ffffff',
  hair: '#dde3df', hairSoft: '#e8ece9', field: '#f2f5f3',
};

// muted accent family per section — colour + structure without brightness
const A = {
  day:   { c: '#4f8a7d', soft: 'var(--sage-soft)' },
  move:  { c: '#5b7a99', soft: 'var(--slate-soft)' },
  rehab: { c: '#3f8f86', soft: 'var(--teal-soft)' },
  meds:  { c: '#7d6b96', soft: 'var(--plum-soft)' },
  note:  { c: '#b3654a', soft: 'var(--clay-soft)' },
};

// ── icons (lucide-style, 1.5px stroke) ──────────────────────────────────────
const Ico = {
  check: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none"
      stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  chevR: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none"
      stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  pill: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none"
      stroke={p.c || 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 20.5-7-7a4.95 4.95 0 1 1 7-7l7 7a4.95 4.95 0 1 1-7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  ),
  sparkles: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none"
      stroke={p.c || 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M5 12H3M21 12h-2M6.3 6.3 7.7 7.7M16.3 16.3l1.4 1.4M6.3 17.7 7.7 16.3M16.3 7.7l1.4-1.4" />
    </svg>
  ),
  activity: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none"
      stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  rotate: (p = {}) => (
    <svg width={p.s || 14} height={p.s || 14} viewBox="0 0 24 24" fill="none"
      stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" />
    </svg>
  ),
  clip: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none"
      stroke={p.c || 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  ),
  heart: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none"
      stroke={p.c || 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  footprints: (p = {}) => (
    <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none"
      stroke={p.c || 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" />
      <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" />
    </svg>
  ),
};

// ── QoL face glyph ──────────────────────────────────────────────────────────
function Face({ level, active, stroke }) {
  // mouth control point: bends up (smile) for higher levels
  const cy = 27 + (level - 2) * 4.6;
  return (
    <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="21" stroke={stroke} strokeWidth={active ? 2.4 : 1.8} />
      <circle cx="17.5" cy="20.5" r="1.9" fill={stroke} />
      <circle cx="30.5" cy="20.5" r="1.9" fill={stroke} />
      <path d={`M15.5 29 Q24 ${cy} 32.5 29`} stroke={stroke} strokeWidth={active ? 2.4 : 1.9}
        strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── data (real fields / seed) ───────────────────────────────────────────────
const QOL = [
  { k: 'Hard', sub: 'Hard day' },
  { k: 'Low', sub: 'Low' },
  { k: 'Okay', sub: 'Okay' },
  { k: 'Good', sub: 'Good' },
  { k: 'Bright', sub: 'Bright' },
];
const MOBILITY = [
  { id: 'rising', label: 'Rising from lying down' },
  { id: 'stairs', label: 'Climbing the stairs' },
];
const MOB_OPTS = ['Easily', 'A bit harder', 'Much harder', "Couldn't"];
const EXERCISES = [
  { id: 'sit_to_stand', name: 'Sit-to-stand', dose: '3 × 5' },
  { id: 'weight_shift', name: 'Weight shifts', dose: '2 × 8' },
  { id: 'cookie_stretch', name: 'Cookie stretch', dose: '1 × 5 each side' },
];
const TOL = [
  { id: 'handled', label: 'Handled', soft: 'var(--sage-soft)', ink: 'var(--sage-ink)' },
  { id: 'a_bit_tired', label: 'A bit tired', soft: 'var(--slate-soft)', ink: '#46617d' },
  { id: 'sore', label: 'Sore', soft: 'var(--gold-soft)', ink: 'var(--gold-ink)' },
  { id: 'refused', label: 'Refused', soft: 'var(--clay-soft)', ink: 'var(--clay-ink)' },
];
const MEDS = [
  { id: 'carprofen', name: 'Carprofen', detail: '75 mg · morning, with food' },
  { id: 'gabapentin', name: 'Gabapentin', detail: '100 mg · evening' },
  { id: 'omega3', name: 'Omega-3', detail: '1 pump · with dinner' },
];

// ── small building blocks ────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      background: C.card, borderRadius: 'var(--radius)', border: `1px solid ${C.hair}`,
      boxShadow: '0 1px 2px rgba(32,38,42,0.04), 0 10px 26px rgba(32,38,42,0.05)',
      padding: 16, ...style,
    }}>{children}</div>
  );
}
function Label({ children, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
      <div style={{ fontSize: 15.5, fontWeight: 650, letterSpacing: -0.2, flex: 1, minWidth: 0 }}>{children}</div>
      {hint && <div style={{ fontSize: 11.5, color: C.muted, display: 'flex', alignItems: 'center', gap: 4, fontVariantNumeric: 'tabular-nums', flexShrink: 0, whiteSpace: 'nowrap' }}>{hint}</div>}
    </div>
  );
}
// coloured icon tile + title — adds contrast, hierarchy, and gentle colour
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

// ── Header ───────────────────────────────────────────────────────────────────
function Header({ progress }) {
  return (
    <div>
      {/* hero banner — opens on Bramble, not a form */}
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: 22, marginBottom: 14,
        background: 'linear-gradient(150deg, #4f8a7d 0%, #46796f 42%, #50708a 100%)',
        boxShadow: '0 14px 30px rgba(58,107,96,0.26)',
        padding: '17px 17px 16px',
      }}>
        {/* soft botanical arcs */}
        <svg width="190" height="190" viewBox="0 0 190 190" style={{ position: 'absolute', top: -54, right: -46, opacity: 0.16 }}>
          <circle cx="95" cy="95" r="78" fill="none" stroke="#fff" strokeWidth="1.4" />
          <circle cx="95" cy="95" r="56" fill="none" stroke="#fff" strokeWidth="1.4" />
          <circle cx="95" cy="95" r="34" fill="none" stroke="#fff" strokeWidth="1.4" />
        </svg>
        <svg width="120" height="60" viewBox="0 0 120 60" style={{ position: 'absolute', bottom: -8, left: -10, opacity: 0.14 }}>
          <path d="M2 50 Q30 6 60 30 T118 18" fill="none" stroke="#fff" strokeWidth="1.4" />
        </svg>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{
            width: 58, height: 58, borderRadius: 999, flexShrink: 0, padding: 3,
            background: 'rgba(255,255,255,0.22)', boxShadow: '0 4px 12px rgba(0,0,0,0.14)',
          }}>
            <img src="assets/oscar.jpg" alt="Oscar"
              style={{ width: '52px', height: '52px', borderRadius: '999px', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.78)', fontWeight: 600, letterSpacing: 0.3 }}>Thursday, June 5</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 23, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.05, marginTop: 2, color: '#fff', whiteSpace: 'nowrap' }}>
              Oscar’s day
            </div>
          </div>
          <div style={{
            alignSelf: 'flex-start', fontSize: 10.5, color: '#fff', fontWeight: 650,
            background: 'rgba(255,255,255,0.18)', padding: '5px 9px', borderRadius: 999, whiteSpace: 'nowrap',
            border: '1px solid rgba(255,255,255,0.22)',
          }}>Week 5 · post-op</div>
        </div>

        {/* consolation line, inside the hero */}
        <div style={{
          position: 'relative', display: 'flex', alignItems: 'center', gap: 9, marginTop: 14,
          background: 'rgba(255,255,255,0.14)', borderRadius: 13, padding: '10px 12px',
          border: '1px solid rgba(255,255,255,0.16)',
        }}>
          <span style={{ color: '#fff', flexShrink: 0, display: 'flex', opacity: 0.92 }}>{Ico.heart({ s: 16, c: '#fff' })}</span>
          <div style={{ fontSize: 12.5, lineHeight: 1.4, color: 'rgba(255,255,255,0.94)' }}>
            However today went, you’re here for Oscar. A few quick notes is all today needs.
          </div>
        </div>
      </div>

      {/* slim completion meter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px', marginBottom: 16 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#e0e6e2', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.round(progress * 100)}%`, height: '100%', borderRadius: 999,
            background: 'linear-gradient(90deg, #4f8a7d, #5b7a99)', transition: 'width .35s var(--gv-ease, ease-out)',
          }} />
        </div>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 650, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {Math.round(progress * 100)}% done
        </div>
      </div>
    </div>
  );
}

// ── QoL faces ────────────────────────────────────────────────────────────────
function QolBlock({ value, onPick }) {
  return (
    <Card>
      <SectionHead icon={Ico.heart({ s: 18, c: A.day.c })} accent={A.day} title="How was Oscar’s day?" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: -4, marginBottom: 15 }}>
        <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.4, flex: 1, minWidth: 0 }}>
          Overall sense — comfort, appetite, mood, mobility.
        </div>
        <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, color: '#7b857f', background: C.field, border: `1px solid ${C.hairSoft}`, padding: '3px 7px', borderRadius: 999, flexShrink: 0 }}>HHHHHMM</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
        {QOL.map((f, i) => {
          const on = value === i;
          return (
            <button key={f.k} className="gv-press" onClick={() => onPick(i)} style={{
              flex: 1, border: 'none', background: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '4px 0',
            }}>
              <span style={{
                width: 48, height: 48, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: on ? 'var(--sage-soft)' : 'transparent',
                boxShadow: on ? `0 0 0 2.5px ${C.sage}` : 'none',
                transition: 'background .15s ease, box-shadow .15s ease',
              }}>
                <Face level={i} active={on} stroke={on ? C.charcoal : '#7e8884'} />
              </span>
              <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 550, color: on ? C.charcoal : C.muted }}>{f.sub}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// ── mobility rotating items ──────────────────────────────────────────────────
function MobilityBlock({ value, onPick }) {
  return (
    <Card>
      <SectionHead
        icon={Ico.footprints({ s: 18, c: A.move.c })} accent={A.move} title="Today’s movement check"
        hint={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{Ico.rotate({ s: 12, c: C.muted })} 2 of 24</span>}
      />
      <div style={{ fontSize: 12.5, color: C.muted, marginTop: -4, marginBottom: 15, lineHeight: 1.4 }}>
        A rotating sample of the mobility items — quick to answer daily.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {MOBILITY.map((m) => (
          <div key={m.id}>
            <div style={{ fontSize: 13.5, fontWeight: 550, marginBottom: 8 }}>{m.label}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {MOB_OPTS.map((opt, oi) => {
                const on = value[m.id] === oi;
                return (
                  <button key={opt} className="gv-press" onClick={() => onPick(m.id, oi)} style={{
                    flex: 1, padding: '8px 2px', borderRadius: 11, cursor: 'pointer',
                    fontSize: 11, fontWeight: on ? 700 : 550, lineHeight: 1.15,
                    border: `1px solid ${on ? A.move.c : C.hair}`,
                    background: on ? A.move.soft : C.field,
                    color: on ? '#46617d' : C.muted,
                  }}>{opt}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── rehab plan + tolerance ───────────────────────────────────────────────────
function RehabBlock({ ex, onToggle, onTol }) {
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 16px 12px' }}>
        <SectionHead icon={Ico.activity({ s: 18, c: A.rehab.c })} accent={A.rehab} title="Rehab plan" hint="Dr. Okafor’s plan" />
      </div>
      {EXERCISES.map((e, i) => {
        const st = ex[e.id];
        return (
          <div key={e.id} style={{ borderTop: `1px solid ${C.hairSoft}`, padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="gv-press" onClick={() => onToggle(e.id)} style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0, cursor: 'pointer',
                border: `1.8px solid ${st.done ? A.rehab.c : C.hair}`,
                background: st.done ? A.rehab.c : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{st.done && Ico.check({ s: 15, c: '#fff', w: 3 })}</button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: st.done ? C.charcoal : '#6f675c' }}>{e.name}</div>
                <div style={{ fontSize: 11.5, color: C.muted, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>{e.dose}</div>
              </div>
            </div>
            {st.done && (
              <div className="gv-rise" style={{ display: 'flex', gap: 6, marginTop: 11, paddingLeft: 38 }}>
                {TOL.map((t) => {
                  const on = st.tol === t.id;
                  return (
                    <button key={t.id} className="gv-press" onClick={() => onTol(e.id, t.id)} style={{
                      flex: 1, padding: '7px 2px', borderRadius: 999, cursor: 'pointer',
                      fontSize: 10.5, fontWeight: on ? 700 : 600, lineHeight: 1.1,
                      border: `1px solid ${on ? 'transparent' : C.hair}`,
                      background: on ? t.soft : '#fff',
                      color: on ? t.ink : C.muted,
                      boxShadow: on ? `inset 0 0 0 1px ${t.ink}33` : 'none',
                    }}>{t.label}</button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
}

// ── meds ─────────────────────────────────────────────────────────────────────
function MedsBlock({ meds, onToggle }) {
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 16px 12px' }}>
        <SectionHead icon={Ico.pill({ s: 18, c: A.meds.c })} accent={A.meds} title="Medications" />
      </div>
      {MEDS.map((m) => {
        const on = meds[m.id];
        return (
          <div key={m.id} style={{ borderTop: `1px solid ${C.hairSoft}`, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>{m.name}</div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{m.detail}</div>
            </div>
            <button className="gv-press" onClick={() => onToggle(m.id)} style={{
              width: 48, height: 29, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: on ? C.sage : '#e2dccf', position: 'relative', transition: 'background .18s ease',
            }}>
              <span style={{
                position: 'absolute', top: 3, left: on ? 22 : 3, width: 23, height: 23, borderRadius: 999,
                background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left .18s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{on && Ico.check({ s: 13, c: C.sage, w: 3 })}</span>
            </button>
          </div>
        );
      })}
    </Card>
  );
}

// ── vet line (bounded danger) ────────────────────────────────────────────────
function VetLine() {
  return (
    <div style={{ textAlign: 'center', fontSize: 12, color: C.muted, padding: '4px 0 2px', lineHeight: 1.5 }}>
      Noticed something worrying?{' '}
      <span style={{ color: C.danger, fontWeight: 650, textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer' }}>
        Contact your vet now
      </span>
    </div>
  );
}

// ── confirmation + gentle insight ────────────────────────────────────────────
function Confirmation({ onBack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
      <div className="gv-rise" style={{ textAlign: 'center', padding: '10px 0 2px' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 999, margin: '0 auto 14px',
          background: 'var(--sage-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'gv-pop .5s cubic-bezier(.2,.7,.3,1) both',
        }}>{Ico.heart({ s: 30, c: C.sage })}</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 25, fontWeight: 500, letterSpacing: -0.3 }}>You showed up for Oscar</div>
        <div style={{ fontSize: 13.5, color: '#52605a', marginTop: 7, lineHeight: 1.5, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
          Another gentle day on the record. That’s how the bigger picture comes together.
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 9, fontVariantNumeric: 'tabular-nums' }}>
          Check-in #34 logged 9:41 AM · 34-day streak
        </div>
      </div>

      {/* gentle pattern-memory insight (pgvector recall) */}
      <div className="gv-rise" style={{
        background: 'linear-gradient(165deg, #ffffff, #f5f9f7)',
        border: `1px solid ${C.hair}`, borderRadius: 'var(--radius)', padding: 18,
        boxShadow: '0 12px 30px rgba(63,123,109,0.12)', animationDelay: '.12s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}>
          <span style={{ display: 'flex', color: C.sage }}>{Ico.sparkles({ s: 15, c: C.sage })}</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: C.sage }}>
            Pattern memory
          </span>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 17.5, fontWeight: 500, lineHeight: 1.36, letterSpacing: -0.1 }}>
          Slower rising has shown up <span style={{ color: C.charcoal, fontWeight: 600, fontStyle: 'italic' }}>3 times in 2 weeks</span>.
        </div>

        {/* tiny day chips */}
        <div style={{ display: 'flex', gap: 7, marginTop: 14, marginBottom: 4 }}>
          {[{ d: 'May 22', h: 16 }, { d: 'May 30', h: 22 }, { d: 'Jun 4', h: 27 }].map((x) => (
            <div key={x.d} style={{
              flex: 1, background: C.field, border: `1px solid ${C.hairSoft}`, borderRadius: 12,
              padding: '9px 8px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: 28 }}>
                <div style={{ width: 7, height: x.h, borderRadius: 3, background: C.sage, opacity: 0.55 }} />
              </div>
              <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{x.d}</div>
            </div>
          ))}
        </div>

        <button className="gv-press" style={{
          width: '100%', marginTop: 14, padding: '12px', borderRadius: 13, cursor: 'pointer',
          border: `1px solid ${C.sage}`, background: 'var(--sage-soft)', color: 'var(--sage-ink)',
          fontSize: 14, fontWeight: 650, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          See how those days went {Ico.chevR({ s: 16, c: 'var(--sage-ink)' })}
        </button>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 11, textAlign: 'center', lineHeight: 1.45 }}>
          A pattern worth mentioning at your next vet visit.
        </div>
      </div>

      <button className="gv-press" onClick={onBack} style={{
        background: 'none', border: 'none', cursor: 'pointer', color: C.muted,
        fontSize: 13.5, fontWeight: 600, padding: '4px', textAlign: 'center',
      }}>Back to today’s check-in</button>

      <VetLine />
      <div style={{ height: 8 }} />
    </div>
  );
}

// ── app ──────────────────────────────────────────────────────────────────────
function CheckinApp() {
  const [qol, setQol] = useState(null);
  const [mob, setMob] = useState({});
  const [ex, setEx] = useState(
    EXERCISES.reduce((a, e) => ({ ...a, [e.id]: { done: false, tol: null } }), {})
  );
  const [meds, setMeds] = useState(MEDS.reduce((a, m) => ({ ...a, [m.id]: false }), {}));
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const ready = qol !== null;

  // gentle completion signal across the five sections
  const progress = (() => {
    let done = 0;
    if (qol !== null) done++;
    if (Object.keys(mob).length >= MOBILITY.length) done++;
    if (EXERCISES.some((e) => ex[e.id].done)) done++;
    if (Object.values(meds).some(Boolean)) done++;
    if (note.trim()) done++;
    return done / 5;
  })();

  const screen = (
    <div className="gv-scroll" style={{
      height: '100%', overflowY: 'auto', background: C.cream,
      padding: '60px 16px 26px',
    }}>
      {submitted ? (
        <Confirmation onBack={() => setSubmitted(false)} />
      ) : (
        <React.Fragment>
          <Header progress={progress} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <QolBlock value={qol} onPick={setQol} />
            <MobilityBlock value={mob} onPick={(id, oi) => setMob((s) => ({ ...s, [id]: oi }))} />
            <RehabBlock
              ex={ex}
              onToggle={(id) => setEx((s) => ({ ...s, [id]: { ...s[id], done: !s[id].done } }))}
              onTol={(id, tol) => setEx((s) => ({ ...s, [id]: { ...s[id], tol } }))}
            />
            <MedsBlock meds={meds} onToggle={(id) => setMeds((s) => ({ ...s, [id]: !s[id] }))} />
            <Card>
              <SectionHead icon={Ico.clip({ s: 18, c: A.note.c })} accent={A.note} title="Anything else about today?" />
              <textarea
                className="gv-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="A short note — what you noticed, a good moment…"
                rows={2}
                style={{
                  width: '100%', resize: 'none', border: `1px solid ${C.hair}`, borderRadius: 12,
                  background: C.field, padding: '11px 12px', fontSize: 14, color: C.charcoal, lineHeight: 1.45,
                }}
              />
            </Card>

            <button
              className="gv-press"
              onClick={() => ready && setSubmitted(true)}
              disabled={!ready}
              style={{
                marginTop: 2, width: '100%', padding: '15px', borderRadius: 15, border: 'none',
                cursor: ready ? 'pointer' : 'not-allowed',
                background: ready ? 'linear-gradient(180deg, #59978a, #437a6d)' : '#dbe3df',
                color: ready ? '#ffffff' : '#9aa49e',
                fontSize: 16, fontWeight: 700, letterSpacing: -0.2,
                boxShadow: ready ? '0 6px 16px rgba(63,123,109,0.30)' : 'none',
                opacity: ready ? 1 : 0.9,
              }}
            >
              {ready ? 'Save today’s check-in' : 'Tap a face to start'}
            </button>
            <VetLine />
            <div style={{ height: 6 }} />
          </div>
        </React.Fragment>
      )}
    </div>
  );

  return (
    <IOSDevice>
      {screen}
    </IOSDevice>
  );
}

window.CheckinApp = CheckinApp;
