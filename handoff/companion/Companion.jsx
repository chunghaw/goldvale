// Oscar — AI Companion chat (mobile). Companion + scribe + vet-prep assistant.
// CARDINAL RULE: never diagnoses, grades, stages, or prescribes. It logs what you tell it,
// recalls your own past notes, narrates your own trends, routes concerns to your vet.
// Grounded in: chat_threads · chat_messages(role, text, media_url) · media_assets(kind,url,
// caption) · agent streams from Bedrock Claude (multimodal), ALWAYS via narrateSafe; tools
// write journal_entries / append vet-brief questions / pgvector recall; red flags →
// red_flag_rules routing.

const { useState, useRef, useEffect } = React;

// ── tokens ──────────────────────────────────────────────────────────────────
const C = {
  cream: '#eef1ef', charcoal: '#20262a', gold: '#d6981e', sage: '#4f8a7d',
  danger: '#c0492b', muted: '#687069', mutedSoft: '#8a938e', card: '#ffffff',
  hair: '#dde3df', hairSoft: '#e8ece9', field: '#f2f5f3',
};

// ── icons ────────────────────────────────────────────────────────────────────
const Ico = {
  sparkles: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth={p.w||1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M4.5 12H2M22 12h-2.5M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6"/><circle cx="12" cy="12" r="3.2"/></svg>),
  shield: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/></svg>),
  check: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth={p.w||2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>),
  plus: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>),
  send: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></svg>),
  file: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>),
  alert: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>),
  phone: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13.83 19.05a16 16 0 0 1-8.88-8.88c-.4-.92-.18-2 .54-2.7l1.3-1.32a1.6 1.6 0 0 1 2.54.3l1 1.66a1.6 1.6 0 0 1-.2 1.95l-.66.74a12 12 0 0 0 4.34 4.34l.74-.66a1.6 1.6 0 0 1 1.95-.2l1.66 1a1.6 1.6 0 0 1 .3 2.54l-1.31 1.3c-.71.72-1.79.94-2.7.54Z"/></svg>),
  camera: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3"/></svg>),
  video: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m16 10 4.5-2.5v9L16 14"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>),
  library: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 20"/></svg>),
  close: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>),
  trend: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17 13.5 8.5l-5 5L2 7"/><path d="M16 17h6v-6"/></svg>),
  heart: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>),
  clip: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>),
};

// ── agent avatar mark ──────────────────────────────────────────────────────
function AgentMark({ s = 28 }) {
  return (
    <div style={{ width: s, height: s, borderRadius: 999, flexShrink: 0, background: 'linear-gradient(150deg, #4f8a7d, #50708a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(63,123,109,0.3)' }}>
      {Ico.sparkles({ s: s * 0.54, c: '#fff', w: 1.9 })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RICH CARDS (embedded inside Oscar bubbles)
// ════════════════════════════════════════════════════════════════════════════
function LoggedChip() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--sage-soft)', border: `1px solid ${C.sage}44`, borderRadius: 999, padding: '6px 12px', marginTop: 10 }}>
      <span style={{ width: 17, height: 17, borderRadius: 999, background: C.sage, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Ico.check({ s: 11, c: '#fff', w: 3 })}</span>
      <span style={{ fontSize: 12.5, fontWeight: 650, color: 'var(--sage-ink)' }}>Logged to Oscar’s journal</span>
    </div>
  );
}
function VetBriefChip() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--clay-soft)', border: `1px solid ${C.charcoal}00`, boxShadow: 'inset 0 0 0 1px rgba(179,101,74,0.32)', borderRadius: 999, padding: '6px 12px', marginTop: 8 }}>
      <span style={{ color: '#97492f', display: 'flex', flexShrink: 0 }}>{Ico.plus({ s: 14, c: '#97492f', w: 2.4 })}</span>
      <span style={{ fontSize: 12.5, fontWeight: 650, color: '#97492f' }}>Added to vet brief</span>
    </div>
  );
}
function RecallCard() {
  const days = [{ d: 'May 22', h: 16 }, { d: 'May 30', h: 22 }, { d: 'Jun 4', h: 27 }];
  return (
    <div style={{ marginTop: 11, background: C.field, border: `1px solid ${C.hairSoft}`, borderRadius: 14, padding: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        {Ico.sparkles({ s: 13, c: C.sage })}
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: C.sage }}>Pattern memory</span>
      </div>
      <div style={{ fontSize: 13.5, fontFamily: 'var(--serif)', fontWeight: 500, lineHeight: 1.35, color: C.charcoal }}>
        Slower rising has come up <span style={{ fontStyle: 'italic', fontWeight: 600 }}>3 times in 2 weeks</span>.
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 11 }}>
        {days.map((x) => (
          <div key={x.d} style={{ flex: 1, background: '#fff', border: `1px solid ${C.hairSoft}`, borderRadius: 10, padding: '7px 6px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: 24 }}>
              <div style={{ width: 6, height: x.h, borderRadius: 3, background: C.sage, opacity: 0.5 }} />
            </div>
            <div style={{ fontSize: 9.5, color: C.muted, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{x.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function MobilityMiniCard() {
  const pts = [48, 45, 42, 39, 36, 34];
  const W = 232, H = 50, lo = 30, hi = 52;
  const x = (i) => 4 + (i * (W - 8)) / (pts.length - 1);
  const y = (v) => 6 + ((hi - v) / (hi - lo)) * (H - 12);
  const line = pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  return (
    <div style={{ marginTop: 11, background: C.field, border: `1px solid ${C.hairSoft}`, borderRadius: 14, padding: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Ico.trend({ s: 13, c: C.sage })}
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: C.sage }}>Mobility · your trend</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sage-ink)', background: 'var(--sage-soft)', padding: '2px 8px', borderRadius: 999 }}>8 better</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <path d={line} fill="none" stroke={C.sage} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={i === pts.length - 1 ? 3.4 : 2} fill={i === pts.length - 1 ? C.sage : '#fff'} stroke={C.sage} strokeWidth="1.5" />)}
      </svg>
    </div>
  );
}
function VetAlertCard() {
  return (
    <div style={{ marginTop: 11, background: 'linear-gradient(168deg, #fff, #fdf1ee)', border: `1px solid ${C.danger}44`, borderRadius: 14, padding: 15, boxShadow: '0 6px 18px rgba(192,73,43,0.12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: 'var(--danger-soft)', color: C.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Ico.alert({ s: 17, c: C.danger })}</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 15.5, fontWeight: 600, color: C.danger, letterSpacing: -0.2 }}>This needs your vet</div>
      </div>
      <div style={{ fontSize: 12.5, color: '#6a4a44', lineHeight: 1.5 }}>
        I can’t assess what’s happening — but what you’re describing is the kind of thing a vet should see promptly.
      </div>
      <button className="gv-press" style={{ width: '100%', marginTop: 13, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', background: C.danger, color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {Ico.phone({ s: 16, c: '#fff' })} <span>Contact your vet now</span>
      </button>
      <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>
        <button className="gv-press" style={{ flex: 1, padding: '10px', borderRadius: 11, cursor: 'pointer', border: `1px solid ${C.hair}`, background: '#fff', color: C.charcoal, fontSize: 12.5, fontWeight: 650 }}>Find nearest clinic</button>
        <button className="gv-press" style={{ flex: 1, padding: '10px', borderRadius: 11, cursor: 'pointer', border: `1px solid ${C.hair}`, background: '#fff', color: C.charcoal, fontSize: 12.5, fontWeight: 650 }}>Log what I saw</button>
      </div>
    </div>
  );
}

// ── message bubbles ────────────────────────────────────────────────────────
function OwnerBubble({ text, photo }) {
  return (
    <div className="gv-msg" style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: 44 }}>
      <div style={{ maxWidth: '100%', background: 'linear-gradient(165deg, #54948a, #437a6d)', color: '#fff', borderRadius: 20, borderBottomRightRadius: 7, padding: photo ? 6 : '11px 14px', boxShadow: '0 4px 12px rgba(63,123,109,0.22)' }}>
        {photo && (
          <div style={{ borderRadius: 15, overflow: 'hidden', marginBottom: text ? 8 : 0, lineHeight: 0 }}>
            <img src={photo} alt="sent" style={{ width: '100%', maxWidth: 210, display: 'block', objectFit: 'cover' }} />
          </div>
        )}
        {text && <div style={{ fontSize: 14.5, lineHeight: 1.42, padding: photo ? '0 8px 6px' : 0 }}>{text}</div>}
      </div>
    </div>
  );
}
function AgentBubble({ children, cards }) {
  return (
    <div className="gv-msg" style={{ display: 'flex', gap: 9, paddingRight: 24 }}>
      <AgentMark s={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ background: '#fff', border: `1px solid ${C.hair}`, borderRadius: 20, borderBottomLeftRadius: 7, padding: '12px 14px', boxShadow: '0 4px 14px rgba(32,38,42,0.05)' }}>
          <div style={{ fontSize: 14.5, lineHeight: 1.5, color: C.charcoal }}>{children}</div>
          {cards}
        </div>
      </div>
    </div>
  );
}
function Typing() {
  return (
    <div className="gv-msg" style={{ display: 'flex', gap: 9 }}>
      <AgentMark s={28} />
      <div style={{ background: '#fff', border: `1px solid ${C.hair}`, borderRadius: 20, borderBottomLeftRadius: 7, padding: '14px 16px', boxShadow: '0 4px 14px rgba(32,38,42,0.05)', display: 'flex', gap: 5, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="gv-dot" style={{ width: 7, height: 7, borderRadius: 999, background: C.sage, display: 'block', animation: `gv-dot 1.2s ${i * 0.18}s infinite ease-in-out` }} />
        ))}
      </div>
    </div>
  );
}
function DayDivider({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 8px' }}>
      <div style={{ flex: 1, height: 1, background: C.hairSoft }} />
      <span style={{ fontSize: 11, color: C.mutedSoft, fontWeight: 650 }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: C.hairSoft }} />
    </div>
  );
}

// ── header ───────────────────────────────────────────────────────────────────
function Header() {
  return (
    <div style={{ flexShrink: 0, position: 'relative', overflow: 'hidden', background: 'linear-gradient(120deg, #4f8a7d 0%, #4a8076 45%, #54748f 100%)', padding: '52px 16px 14px' }}>
      <svg width="150" height="150" viewBox="0 0 150 150" style={{ position: 'absolute', top: -50, right: -36, opacity: 0.14 }}>
        <circle cx="75" cy="75" r="62" fill="none" stroke="#fff" strokeWidth="1.3" />
        <circle cx="75" cy="75" r="42" fill="none" stroke="#fff" strokeWidth="1.3" />
        <circle cx="75" cy="75" r="22" fill="none" stroke="#fff" strokeWidth="1.3" />
      </svg>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 42, height: 42, borderRadius: 999, flexShrink: 0, padding: 2.5, background: 'rgba(255,255,255,0.22)' }}>
          <img src="assets/oscar.jpg" alt="Oscar" style={{ width: '37px', height: '37px', borderRadius: '999px', objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 500, color: '#fff', letterSpacing: -0.2, lineHeight: 1.1 }}>Oscar companion</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.82)', fontWeight: 500, marginTop: 1 }}>Here for Oscar · always remembers</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#fff', fontWeight: 650, background: 'rgba(255,255,255,0.18)', padding: '5px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.24)', flexShrink: 0 }}>
          {Ico.shield({ s: 12, c: '#fff' })} <span>Non-clinical</span>
        </div>
      </div>
    </div>
  );
}

// ── suggestion chips (empty state) ────────────────────────────────────────────
const SUGGESTIONS = ["How’s Oscar’s week?", "Log a symptom", "Add a photo of the incision", "Help me prep for the vet"];
function EmptyIntro({ onPick }) {
  return (
    <div style={{ padding: '8px 2px' }}>
      <AgentBubble>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 16.5, fontWeight: 500, lineHeight: 1.4, marginBottom: 6, letterSpacing: -0.2 }}>Hello — I’m so glad you’re here.</div>
        I’m here to help you keep track of Oscar and get ready for the vet. I can’t diagnose — but I remember everything, so you don’t have to.
      </AgentBubble>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16, paddingLeft: 37 }}>
        {SUGGESTIONS.map((s, i) => {
          const accents = ['var(--sage-soft)', 'var(--slate-soft)', 'var(--teal-soft)', 'var(--gold-soft)'];
          const inks = ['#3a6b60', '#46617d', '#2f6a62', '#8a6410'];
          return (
            <button key={s} className="gv-press" onClick={() => onPick(s)} style={{
              padding: '9px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              border: `1px solid ${C.hair}`, background: accents[i], color: inks[i],
            }}>{s}</button>
          );
        })}
      </div>
    </div>
  );
}

// ── attach menu ────────────────────────────────────────────────────────────
function AttachMenu({ onPhoto, onClose }) {
  const items = [
    { ic: Ico.camera, label: 'Photo', a: 'var(--sage-soft)', c: '#3a6b60', fn: onPhoto },
    { ic: Ico.video, label: 'Video', a: 'var(--slate-soft)', c: '#46617d', fn: onPhoto },
    { ic: Ico.library, label: 'Library', a: 'var(--teal-soft)', c: '#2f6a62', fn: onPhoto },
  ];
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 14 }} />
      <div className="gv-rise" style={{ position: 'absolute', left: 12, bottom: 70, zIndex: 15, background: '#fff', border: `1px solid ${C.hair}`, borderRadius: 16, padding: 7, boxShadow: '0 12px 30px rgba(32,38,42,0.16)', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 168 }}>
        {items.map((it) => (
          <button key={it.label} className="gv-press" onClick={() => { it.fn(); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 11px', borderRadius: 11, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: it.a, color: it.c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{it.ic({ s: 17, c: it.c })}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>{it.label}</span>
          </button>
        ))}
      </div>
    </React.Fragment>
  );
}

// ── input bar ──────────────────────────────────────────────────────────────
function InputBar({ value, onChange, onSend, attached, onAttach, onRemoveAttach, menuOpen, setMenuOpen, onPhoto }) {
  const canSend = value.trim() || attached;
  return (
    <div style={{ flexShrink: 0, position: 'relative', background: 'rgba(238,241,239,0.92)', backdropFilter: 'blur(8px)', borderTop: `1px solid ${C.hairSoft}`, padding: '10px 12px 12px' }}>
      {menuOpen && <AttachMenu onPhoto={onPhoto} onClose={() => setMenuOpen(false)} />}

      {/* attached thumbnail chip */}
      {attached && (
        <div className="gv-rise" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#fff', border: `1px solid ${C.hair}`, borderRadius: 13, padding: 6, marginBottom: 9, boxShadow: '0 2px 8px rgba(32,38,42,0.06)' }}>
          <img src={attached} alt="attached" style={{ width: 40, height: 40, borderRadius: 9, objectFit: 'cover', display: 'block' }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: C.charcoal, paddingRight: 2 }}>Photo ready</span>
          <button className="gv-press" onClick={onRemoveAttach} aria-label="Remove" style={{ width: 24, height: 24, borderRadius: 999, border: 'none', background: C.field, color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Ico.close({ s: 13, c: C.muted })}</button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9 }}>
        <button className="gv-press" onClick={() => setMenuOpen((o) => !o)} aria-label="Attach" style={{
          width: 42, height: 42, borderRadius: 999, flexShrink: 0, cursor: 'pointer',
          border: `1px solid ${C.hair}`, background: menuOpen ? C.sage : '#fff', color: menuOpen ? '#fff' : C.sage,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s, transform .2s', transform: menuOpen ? 'rotate(45deg)' : 'none',
        }}>{Ico.plus({ s: 20, c: menuOpen ? '#fff' : C.sage })}</button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', border: `1px solid ${C.hair}`, borderRadius: 22, padding: '4px 6px 4px 15px', minHeight: 42 }}>
          <input
            value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onSend(); }}
            placeholder="Tell Oscar about Oscar…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14.5, fontFamily: 'inherit', color: C.charcoal, padding: '7px 0' }}
          />
          <button className="gv-press" onClick={onSend} disabled={!canSend} aria-label="Send" style={{
            width: 34, height: 34, borderRadius: 999, flexShrink: 0, cursor: canSend ? 'pointer' : 'not-allowed',
            border: 'none', background: canSend ? 'linear-gradient(165deg, #54948a, #437a6d)' : '#dbe3df',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: canSend ? '0 3px 9px rgba(63,123,109,0.3)' : 'none',
          }}>{Ico.send({ s: 16, c: canSend ? '#fff' : '#9aa49e' })}</button>
        </div>
      </div>

      {/* persistent disclaimer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 9 }}>
        {Ico.shield({ s: 12, c: C.mutedSoft })}
        <span style={{ fontSize: 10.5, color: C.muted, fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>
          Oscar remembers and prepares — it doesn’t diagnose. Your vet decides.
        </span>
      </div>
    </div>
  );
}

// ── demo-state switcher (review aid — not product UI) ─────────────────────────
function StateSwitcher({ value, onChange }) {
  const opts = [{ k: 'empty', l: 'Intro' }, { k: 'convo', l: 'Conversation' }, { k: 'redflag', l: 'Red flag' }];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, justifyContent: 'center' }}>
      <span style={{ fontSize: 10.5, color: C.mutedSoft, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Demo state</span>
      <div style={{ display: 'flex', gap: 3, background: '#fff', border: `1px solid ${C.hair}`, borderRadius: 999, padding: 3, boxShadow: '0 2px 8px rgba(32,38,42,0.06)' }}>
        {opts.map((o) => {
          const on = value === o.k;
          return (
            <button key={o.k} className="gv-press" onClick={() => onChange(o.k)} style={{
              padding: '6px 13px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: on ? 700 : 600,
              background: on ? C.sage : 'transparent', color: on ? '#fff' : C.muted,
            }}>{o.l}</button>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// APP
// ════════════════════════════════════════════════════════════════════════════
function CompanionApp() {
  const [view, setView] = useState('convo'); // empty · convo · redflag
  const [text, setText] = useState('');
  const [attached, setAttached] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [view]);

  const onSwitch = (v) => { setView(v); setMenuOpen(false); setAttached(null); setText(''); };

  let thread;
  if (view === 'empty') {
    thread = <EmptyIntro onPick={(s) => setText(s)} />;
  } else if (view === 'redflag') {
    thread = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '6px 2px' }}>
        <DayDivider>Today</DayDivider>
        <OwnerBubble text="Oscar suddenly can’t put weight on his back leg and he’s shaking. He was doing so well yesterday." />
        <AgentBubble cards={<VetAlertCard />}>
          That can’t wait for me — please contact your vet now.
        </AgentBubble>
      </div>
    );
  } else {
    thread = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '6px 2px' }}>
        <DayDivider>Today</DayDivider>
        <OwnerBubble text="Oscar seemed a bit stiff getting up this morning, but he ate well and wagged for his walk." />
        <AgentBubble cards={<React.Fragment><LoggedChip /><RecallCard /></React.Fragment>}>
          Noted — I’ve saved that to today’s journal. A good appetite and a wag are lovely signs. One thing I’m holding onto for you:
        </AgentBubble>
        <OwnerBubble text="Here’s the incision from this morning." photo="assets/incision-demo.jpg" />
        <AgentBubble cards={<VetBriefChip />}>
          Thanks — I’ve saved this to Oscar’s log. I can’t assess it, but redness, heat, or discharge are worth your vet seeing. Want me to flag it for the visit? I’ve gone ahead and added it.
        </AgentBubble>
        <Typing />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <StateSwitcher value={view} onChange={onSwitch} />
      <IOSDevice>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.cream }}>
          <Header />
          <div ref={scrollRef} className="gv-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px' }}>
            {thread}
          </div>
          <InputBar
            value={text} onChange={setText}
            onSend={() => { setText(''); setAttached(null); }}
            attached={attached}
            onRemoveAttach={() => setAttached(null)}
            menuOpen={menuOpen} setMenuOpen={setMenuOpen}
            onPhoto={() => setAttached('assets/incision-demo.jpg')}
          />
        </div>
      </IOSDevice>
    </div>
  );
}

window.CompanionApp = CompanionApp;
