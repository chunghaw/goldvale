// Oscar — Vet brief (mobile). The curated summary the owner brings to a visit.
// Grounded in lib/domain/*: GenPup-M (34/108, baseline 42, MCID=8, Mild band),
// progression.ts (6 clean sessions ≥14d → ask vet, question-framed), pattern
// memory recall, seed meds. Non-clinical: it PREPARES for the vet, never diagnoses.

const { useState } = React;

const C = {
  cream: '#eef1ef', charcoal: '#20262a', gold: '#d6981e', sage: '#4f8a7d',
  danger: '#c0492b', muted: '#687069', mutedSoft: '#8a938e', card: '#ffffff',
  hair: '#dde3df', hairSoft: '#e8ece9', field: '#f2f5f3',
};
const A = {
  mention: { c: '#b3654a', soft: 'var(--clay-soft)' },
  snap:    { c: '#4f8a7d', soft: 'var(--sage-soft)' },
  meds:    { c: '#7d6b96', soft: 'var(--plum-soft)' },
  ask:     { c: '#5b7a99', soft: 'var(--slate-soft)' },
};

const Ico = {
  trend: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17 13.5 8.5l-5 5L2 7"/><path d="M16 17h6v-6"/></svg>),
  repeat: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>),
  activity: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>),
  pill: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5-7-7a4.95 4.95 0 1 1 7-7l7 7a4.95 4.95 0 1 1-7 7Z"/><path d="m8.5 8.5 7 7"/></svg>),
  help: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>),
  share: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>),
  check: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth={p.w||2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>),
  plus: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>),
  cal: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>),
};

// ── shells ──────────────────────────────────────────────────────────────────
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
      <div style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, background: accent.soft, color: accent.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 500, letterSpacing: -0.2 }}>{title}</div>
      {hint && <div style={{ fontSize: 11.5, color: C.muted, display: 'flex', alignItems: 'center', gap: 4, fontVariantNumeric: 'tabular-nums', flexShrink: 0, whiteSpace: 'nowrap' }}>{hint}</div>}
    </div>
  );
}

// ── data (grounded) ─────────────────────────────────────────────────────────
const MENTIONS = [
  {
    id: 'mobility', icon: Ico.trend, accent: A.snap,
    title: 'Mobility improved 8 points',
    body: 'GenPup-M is 34 now vs 42 four weeks ago — past the point Oscar flags as meaningful. Still in the “mild” band.',
    tag: 'Trend',
  },
  {
    id: 'rising', icon: Ico.repeat, accent: A.mention,
    title: 'Slower rising, 3 times in 2 weeks',
    body: 'Harder getting up from lying down on May 22, May 30, and Jun 4 — clustered in the mornings.',
    tag: 'Pattern',
  },
  {
    id: 'progress', icon: Ico.activity, accent: { c: '#3f8f86', soft: 'var(--teal-soft)' },
    title: 'Ready to progress exercise?',
    body: '6 clean rehab sessions over 18 days. A question for you — is Oscar ready for a little more?',
    tag: 'Question',
  },
];

const MEDS = [
  { name: 'Carprofen', detail: '75 mg · morning, with food', adh: '27 / 28 days' },
  { name: 'Gabapentin', detail: '100 mg · evening', adh: '28 / 28 days' },
  { name: 'Omega-3', detail: '1 pump · with dinner', adh: '25 / 28 days' },
];

const SEED_QUESTIONS = [
  'Is the 8-point mobility gain enough to ease the leash-walk limit?',
  'Should the morning stiffness change the gabapentin timing?',
];

// ── hero ────────────────────────────────────────────────────────────────────
function Hero({ included }) {
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
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.78)', fontWeight: 600, letterSpacing: 0.3 }}>Brief for Dr. Okafor</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 23, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.05, marginTop: 2, color: '#fff', whiteSpace: 'nowrap' }}>
            Oscar’s vet brief
          </div>
        </div>
        <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#fff', fontWeight: 650, background: 'rgba(255,255,255,0.18)', padding: '5px 9px', borderRadius: 999, whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.22)' }}>
          {Ico.cal({ s: 12, c: '#fff' })} Jun 18
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', gap: 9, marginTop: 14 }}>
        {[
          { k: '28-day', l: 'window' },
          { k: `${included} of ${MENTIONS.length}`, l: 'to mention' },
          { k: 'Mild', l: 'mobility band' },
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

// ── things to mention (toggleable) ──────────────────────────────────────────
function MentionRow({ m, on, onToggle }) {
  return (
    <button className="gv-press" onClick={onToggle} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 12,
      padding: '13px 14px', borderRadius: 14, alignItems: 'flex-start',
      border: `1px solid ${on ? C.hair : C.hairSoft}`,
      background: on ? '#fff' : C.field,
      opacity: on ? 1 : 0.55,
    }}>
      <div style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, background: m.accent.soft, color: m.accent.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {m.icon({ s: 18, c: m.accent.c })}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.1, flex: 1 }}>{m.title}</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: m.accent.c, background: m.accent.soft, padding: '2px 6px', borderRadius: 999, flexShrink: 0 }}>{m.tag}</span>
        </div>
        <div style={{ fontSize: 12, color: '#4a544f', lineHeight: 1.4, marginTop: 4 }}>{m.body}</div>
      </div>
      <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 2, border: `1.8px solid ${on ? m.accent.c : C.hair}`, background: on ? m.accent.c : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {on && Ico.check({ s: 13, c: '#fff', w: 3 })}
      </div>
    </button>
  );
}

// ── snapshot row ────────────────────────────────────────────────────────────
function Snapshot() {
  const stats = [
    { k: '34', u: '/108', l: 'Mobility · mild' },
    { k: '6.0', u: '/7', l: 'Avg day · good' },
    { k: '93', u: '%', l: 'Med adherence' },
  ];
  return (
    <Card>
      <SectionHead icon={Ico.trend({ s: 18, c: A.snap.c })} accent={A.snap} title="28-day snapshot" />
      <div style={{ display: 'flex', gap: 9 }}>
        {stats.map((s) => (
          <div key={s.l} style={{ flex: 1, background: C.field, border: `1px solid ${C.hairSoft}`, borderRadius: 13, padding: '12px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 500, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>{s.k}</span>
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{s.u}</span>
            </div>
            <div style={{ fontSize: 10.5, color: C.muted, marginTop: 4, lineHeight: 1.2 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── meds ────────────────────────────────────────────────────────────────────
function MedsCard() {
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 16px 12px' }}>
        <SectionHead icon={Ico.pill({ s: 18, c: A.meds.c })} accent={A.meds} title="Current medications" />
      </div>
      {MEDS.map((m) => (
        <div key={m.name} style={{ borderTop: `1px solid ${C.hairSoft}`, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{m.detail}</div>
          </div>
          <div style={{ fontSize: 11.5, color: A.meds.c, fontWeight: 650, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{m.adh}</div>
        </div>
      ))}
    </Card>
  );
}

// ── questions for the vet (owner-editable) ──────────────────────────────────
function QuestionsCard() {
  const [qs, setQs] = useState(SEED_QUESTIONS);
  const [draft, setDraft] = useState('');
  const add = () => { const t = draft.trim(); if (!t) return; setQs((s) => [...s, t]); setDraft(''); };
  return (
    <Card>
      <SectionHead icon={Ico.help({ s: 18, c: A.ask.c })} accent={A.ask} title="Questions to ask" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {qs.map((q, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: C.field, border: `1px solid ${C.hairSoft}`, borderRadius: 12, padding: '10px 12px' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 600, color: A.ask.c, lineHeight: 1.4, flexShrink: 0 }}>{i + 1}.</span>
            <span style={{ fontSize: 12.5, lineHeight: 1.45, color: '#3c453f' }}>{q}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          placeholder="Add a question for the visit…"
          style={{ flex: 1, border: `1px solid ${C.hair}`, borderRadius: 11, background: '#fff', padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', color: C.charcoal, outline: 'none' }}
        />
        <button className="gv-press" onClick={add} style={{ flexShrink: 0, width: 42, borderRadius: 11, border: `1px solid ${A.ask.c}`, background: 'var(--slate-soft)', color: A.ask.c, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Ico.plus({ s: 18, c: A.ask.c })}
        </button>
      </div>
    </Card>
  );
}

// ── app ─────────────────────────────────────────────────────────────────────
function VetBriefApp() {
  const [inc, setInc] = useState(MENTIONS.reduce((a, m) => ({ ...a, [m.id]: true }), {}));
  const [shared, setShared] = useState(false);
  const includedCount = Object.values(inc).filter(Boolean).length;

  return (
    <IOSDevice>
      <div className="gv-scroll" style={{ height: '100%', overflowY: 'auto', background: C.cream, padding: '60px 16px 26px' }}>
        <Hero included={includedCount} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <Card>
            <SectionHead icon={Ico.share({ s: 18, c: A.mention.c })} accent={A.mention} title="Things to mention" hint={`${includedCount} of ${MENTIONS.length}`} />
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: -4, marginBottom: 13, lineHeight: 1.45 }}>
              Oscar surfaced these from your check-ins. Tap to choose what goes in the brief.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {MENTIONS.map((m) => (
                <MentionRow key={m.id} m={m} on={inc[m.id]} onToggle={() => setInc((s) => ({ ...s, [m.id]: !s[m.id] }))} />
              ))}
            </div>
          </Card>

          <Snapshot />
          <MedsCard />
          <QuestionsCard />

          {/* share / export */}
          <button className="gv-press" onClick={() => setShared(true)} style={{
            width: '100%', padding: '15px', borderRadius: 15, border: 'none', cursor: 'pointer',
            background: shared ? 'var(--sage-soft)' : 'linear-gradient(180deg, #59978a, #437a6d)',
            color: shared ? 'var(--sage-ink)' : '#fff',
            fontSize: 15.5, fontWeight: 700, letterSpacing: -0.2,
            boxShadow: shared ? 'none' : '0 6px 16px rgba(63,123,109,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap',
            border: shared ? `1px solid ${C.sage}` : 'none',
          }}>
            {shared ? <React.Fragment>{Ico.check({ s: 17, c: 'var(--sage-ink)', w: 2.6 })} Brief ready to share</React.Fragment>
                    : <React.Fragment>{Ico.share({ s: 17, c: '#fff' })} Share brief with vet</React.Fragment>}
          </button>

          <div style={{ fontSize: 11.5, color: C.muted, textAlign: 'center', lineHeight: 1.5, padding: '2px 14px' }}>
            Oscar prepares and remembers. It doesn’t diagnose — your vet reads the full picture.
          </div>
          <div style={{ height: 6 }} />
        </div>
      </div>
    </IOSDevice>
  );
}

window.VetBriefApp = VetBriefApp;
