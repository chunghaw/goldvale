// Goldvale — Media timeline / Visual recall (mobile). Route /pets/[id]/media.
// Date-grouped grid of photos + clips; each with caption + "mention at vet" toggle.
// "Similar days" opens a VISUAL RECALL strip (same subject over time). Non-clinical:
// keeps the record, never diagnoses. Grounded in: media_assets(pet_id, kind, url, caption,
// embedding vector(1024), recorded_at, journal_entry_id, mention_at_vet) · Titan multimodal
// embeddings → pgvector kNN for "similar days" · video self-similarity via
// pose_consistency_events (NEVER gait diagnosis).
// IIFE-wrapped to coexist with Capture.jsx on one page.
(function () {
  const { useState } = React;

  const C = {
    cream: '#eef1ef', charcoal: '#20262a', gold: '#d6981e', sage: '#4f8a7d',
    danger: '#c0492b', muted: '#687069', mutedSoft: '#8a938e', card: '#ffffff',
    hair: '#dde3df', hairSoft: '#e8ece9', field: '#f2f5f3',
  };

  const I = {
    play: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill={p.c||'currentColor'}><path d="M8 5v14l11-7z"/></svg>),
    layers: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>),
    check: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth={p.w||2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>),
    close: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>),
    sparkles: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M5 12H3M21 12h-2M6.3 6.3 7.7 7.7M16.3 16.3l1.4 1.4M6.3 17.7 7.7 16.3M16.3 7.7l1.4-1.4"/></svg>),
    flag: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1Z"/><path d="M4 22v-7"/></svg>),
    shield: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/></svg>),
    chevR: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>),
  };

  // ── demo data ──
  const GROUPS = [
    { day: 'Today · Jun 12', items: [
      { id: 'm1', kind: 'photo', src: 'assets/media-incision-6.jpg', cap: 'The incision — looking calm', recall: true },
      { id: 'm2', kind: 'video', src: 'assets/media-clip-garden.jpg', cap: 'Morning walk in the garden', dur: '0:12' },
    ]},
    { day: 'This week', items: [
      { id: 'm3', kind: 'photo', src: 'assets/media-walk.jpg', cap: 'Good wag on the green', mention: true },
      { id: 'm4', kind: 'photo', src: 'assets/media-rest.jpg', cap: 'Resting after lunch' },
      { id: 'm5', kind: 'video', src: 'assets/media-clip-stairs.jpg', cap: 'Trying the bottom step', dur: '0:09' },
    ]},
    { day: 'Last week', items: [
      { id: 'm6', kind: 'photo', src: 'assets/media-incision-4.jpg', cap: 'The incision — day 24', recall: true, mention: true },
      { id: 'm7', kind: 'photo', src: 'assets/media-walk.jpg', cap: 'Slow loop of the block' },
    ]},
  ];
  // visual recall series — the incision over 6 weeks
  const RECALL = [
    { src: 'assets/media-incision-1.jpg', date: 'May 1', wk: 'Day 1' },
    { src: 'assets/media-incision-2.jpg', date: 'May 9', wk: 'Wk 1' },
    { src: 'assets/media-incision-3.jpg', date: 'May 16', wk: 'Wk 2' },
    { src: 'assets/media-incision-4.jpg', date: 'May 28', wk: 'Wk 4' },
    { src: 'assets/media-incision-5.jpg', date: 'Jun 5', wk: 'Wk 5' },
    { src: 'assets/media-incision-6.jpg', date: 'Jun 12', wk: 'Wk 6' },
  ];

  // ── tile ──
  function Tile({ it, onOpen, onMention, mentioned }) {
    return (
      <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: C.field, border: `1px solid ${C.hairSoft}` }}>
        <div style={{ position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden' }}>
          <img src={it.src} alt={it.cap} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          {it.kind === 'video' && (
            <React.Fragment>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.28))' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 34, height: 34, borderRadius: 999, background: 'rgba(0,0,0,0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{I.play({ s: 16, c: '#fff' })}</div>
              <div style={{ position: 'absolute', bottom: 7, right: 7, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, fontVariantNumeric: 'tabular-nums' }}>{it.dur}</div>
            </React.Fragment>
          )}
          {/* mention toggle */}
          <button className="gv-press" onClick={(e) => { e.stopPropagation(); onMention(it.id); }} aria-label="Mention at vet" style={{ position: 'absolute', top: 7, right: 7, width: 28, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', background: mentioned ? C.gold : 'rgba(0,0,0,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: mentioned ? '0 2px 6px rgba(214,152,30,0.5)' : 'none' }}>{I.flag({ s: 14, c: '#fff' })}</button>
          {/* recall affordance */}
          {it.recall && (
            <button className="gv-press" onClick={() => onOpen(it)} style={{ position: 'absolute', bottom: 7, left: 7, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: 999, padding: '4px 9px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>{I.layers({ s: 12, c: C.sage })}<span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--sage-ink)' }}>Similar days</span></button>
          )}
        </div>
        <div style={{ padding: '8px 9px 9px' }}>
          <div style={{ fontSize: 11.5, color: '#3c453f', fontWeight: 550, lineHeight: 1.3 }}>{it.cap}</div>
        </div>
      </div>
    );
  }

  // ── header ──
  function Header() {
    return (
      <div style={{ flexShrink: 0, position: 'relative', overflow: 'hidden', background: 'linear-gradient(120deg, #4f8a7d 0%, #4a8076 45%, #54748f 100%)', padding: '52px 16px 16px' }}>
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
            <div style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 500, color: '#fff', letterSpacing: -0.2, lineHeight: 1.1 }}>Oscar’s photos &amp; clips</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.82)', fontWeight: 500, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>24 photos · 5 clips</div>
          </div>
        </div>
      </div>
    );
  }

  // ── visual recall overlay ──
  function RecallSheet({ onClose }) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(32,38,42,0.4)', animation: 'gv-rise .3s ease both' }} />
        <div className="gv-sheet" style={{ position: 'relative', background: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: '12px 0 24px', boxShadow: '0 -12px 40px rgba(0,0,0,0.18)' }}>
          <div style={{ width: 40, height: 5, borderRadius: 999, background: '#dde3df', margin: '0 auto 14px' }} />
          <div style={{ padding: '0 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                {I.sparkles({ s: 14, c: C.sage })}
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: C.sage }}>Visual recall</span>
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, letterSpacing: -0.3 }}>The incision, over time</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>6 photos over 6 weeks · same spot</div>
            </div>
            <button className="gv-press" onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${C.hair}`, background: '#fff', color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{I.close({ s: 15, c: C.muted })}</button>
          </div>

          {/* horizontal series */}
          <div className="gv-hscroll" style={{ display: 'flex', gap: 11, overflowX: 'auto', padding: '16px 18px 8px' }}>
            {RECALL.map((r, i) => (
              <div key={i} style={{ flexShrink: 0, width: 116 }}>
                <div style={{ position: 'relative', borderRadius: 13, overflow: 'hidden', border: i === RECALL.length - 1 ? `2px solid ${C.sage}` : `1px solid ${C.hairSoft}` }}>
                  <img src={r.src} alt={r.date} style={{ width: '100%', height: 116, objectFit: 'cover', display: 'block' }} />
                  {i === RECALL.length - 1 && <div style={{ position: 'absolute', top: 6, left: 6, background: C.sage, color: '#fff', fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>Latest</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6, padding: '0 2px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.charcoal }}>{r.wk}</span>
                  <span style={{ fontSize: 10.5, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{r.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* non-clinical line */}
          <div style={{ margin: '8px 18px 0', display: 'flex', gap: 9, alignItems: 'flex-start', background: C.field, border: `1px solid ${C.hairSoft}`, borderRadius: 13, padding: '11px 13px' }}>
            <span style={{ color: C.sage, flexShrink: 0, marginTop: 1 }}>{I.shield({ s: 15, c: C.sage })}</span>
            <div style={{ fontSize: 11.5, color: '#42504b', lineHeight: 1.5 }}>Side by side, so you can see the change yourself. Goldvale keeps the record — it doesn’t diagnose. Your vet reads the full picture.</div>
          </div>

          <div style={{ padding: '14px 18px 0' }}>
            <button className="gv-press" style={{ width: '100%', padding: '13px', borderRadius: 13, border: `1px solid ${C.gold}`, background: 'var(--gold-soft)', color: '#8a6410', fontSize: 14, fontWeight: 650, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {I.flag({ s: 15, c: '#8a6410' })} <span>Add this series to the vet brief</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  function MediaTimelineApp() {
    const [recall, setRecall] = useState(false);
    const [mentions, setMentions] = useState(() => {
      const m = {}; GROUPS.forEach((g) => g.items.forEach((it) => { if (it.mention) m[it.id] = true; })); return m;
    });
    const toggleMention = (id) => setMentions((s) => ({ ...s, [id]: !s[id] }));
    const mentionCount = Object.values(mentions).filter(Boolean).length;

    return (
      <IOSDevice>
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', background: C.cream }}>
          <Header />
          <div className="gv-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px' }}>
            {/* mention summary */}
            {mentionCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--gold-soft)', border: '1px solid rgba(214,152,30,0.32)', borderRadius: 14, padding: '10px 13px', marginBottom: 14 }}>
                <span style={{ color: '#8a6410', flexShrink: 0 }}>{I.flag({ s: 15, c: '#8a6410' })}</span>
                <span style={{ flex: 1, fontSize: 12.5, color: '#6a5520', fontWeight: 600 }}>{mentionCount} flagged for Oscar’s next vet visit</span>
                <span style={{ display: 'flex', color: '#8a6410' }}>{I.chevR({ s: 15, c: '#8a6410' })}</span>
              </div>
            )}

            {GROUPS.map((g) => (
              <div key={g.day} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: 0.2, marginBottom: 10, paddingLeft: 2 }}>{g.day}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {g.items.map((it) => (
                    <Tile key={it.id} it={it} onOpen={() => setRecall(true)} onMention={toggleMention} mentioned={!!mentions[it.id]} />
                  ))}
                </div>
              </div>
            ))}

            {/* footer disclaimer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '6px 14px 14px', textAlign: 'center' }}>
              {I.shield({ s: 13, c: C.mutedSoft })}
              <span style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>Goldvale keeps the record. It doesn’t diagnose — your vet reads the full picture.</span>
            </div>
          </div>

          {recall && <RecallSheet onClose={() => setRecall(false)} />}
        </div>
      </IOSDevice>
    );
  }

  window.MediaTimelineApp = MediaTimelineApp;
})();
