// Oscar — Capture sheet (mobile bottom sheet). Opens from companion chat / daily check-in.
// "Add a photo or video" → photo / clip / library, caption, target chip. Non-clinical:
// clips are compared to Oscar's OWN past clips, never graded. Grounded in:
// media_assets(pet_id, kind, url, caption, embedding, recorded_at, journal_entry_id,
// mention_at_vet) · S3 presigned upload · Titan multimodal embeddings.
// IIFE-wrapped so it can share a page with MediaTimeline.jsx without global collisions.
(function () {
  const { useState } = React;

  const C = {
    cream: '#eef1ef', charcoal: '#20262a', gold: '#d6981e', sage: '#4f8a7d',
    danger: '#c0492b', muted: '#687069', mutedSoft: '#8a938e', card: '#ffffff',
    hair: '#dde3df', hairSoft: '#e8ece9', field: '#f2f5f3',
  };

  const I = {
    camera: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3"/></svg>),
    video: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m16 10 4.5-2.5v9L16 14"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>),
    library: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 20"/></svg>),
    check: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth={p.w||2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>),
    close: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>),
    clip: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>),
    lock: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>),
    shield: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/></svg>),
    stop: (p={}) => (<svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="none"><rect x="7" y="7" width="10" height="10" rx="2.5" fill={p.c||'currentColor'}/></svg>),
  };

  // ── faded backdrop (the surface the sheet opens over) ──
  function Backdrop() {
    return (
      <div style={{ position: 'absolute', inset: 0, background: C.cream, overflow: 'hidden' }}>
        <div style={{ height: 92, background: 'linear-gradient(120deg, #4f8a7d, #54748f)', opacity: 0.5 }} />
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.4 }}>
          {[0,1,2].map((i) => <div key={i} style={{ height: 54, borderRadius: 16, background: '#fff', border: `1px solid ${C.hair}` }} />)}
        </div>
      </div>
    );
  }

  function Tile({ icon, label, sub, accent, ink, onClick, primary }) {
    return (
      <button className="gv-press" onClick={onClick} style={{
        flex: 1, cursor: 'pointer', border: `1px solid ${primary ? 'transparent' : C.hair}`,
        background: primary ? accent : '#fff', borderRadius: 16, padding: '15px 8px 13px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, textAlign: 'center',
        boxShadow: primary ? `inset 0 0 0 1.5px ${ink}22` : 'none',
      }}>
        <span style={{ width: 44, height: 44, borderRadius: 13, background: primary ? '#fff' : accent, color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon({ s: 22, c: ink })}</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.charcoal, lineHeight: 1.2 }}>{label}</span>
        {sub && <span style={{ fontSize: 10, color: C.muted, lineHeight: 1.25 }}>{sub}</span>}
      </button>
    );
  }

  const TARGETS = ["Today’s log", "Companion chat", "Vet brief"];

  function CaptureApp() {
    const [mode, setMode] = useState('idle'); // idle · photo · recording
    const [caption, setCaption] = useState('');
    const [target, setTarget] = useState(0);
    const [kind, setKind] = useState('photo'); // photo | video

    const attached = mode === 'photo';
    const recording = mode === 'recording';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* demo-state switcher (review aid — not product UI) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, justifyContent: 'center' }}>
          <span style={{ fontSize: 10.5, color: C.mutedSoft, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Sheet state</span>
          <div style={{ display: 'flex', gap: 3, background: '#fff', border: `1px solid ${C.hair}`, borderRadius: 999, padding: 3, boxShadow: '0 2px 8px rgba(32,38,42,0.06)' }}>
            {[{k:'idle',l:'Idle'},{k:'photo',l:'Photo attached'},{k:'recording',l:'Recording'}].map((o) => {
              const on = mode === o.k;
              return <button key={o.k} className="gv-press" onClick={() => setMode(o.k)} style={{ padding: '6px 12px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 11.5, fontWeight: on ? 700 : 600, background: on ? C.sage : 'transparent', color: on ? '#fff' : C.muted }}>{o.l}</button>;
            })}
          </div>
        </div>

        <IOSDevice>
          <div style={{ position: 'relative', height: '100%', background: C.cream }}>
            <Backdrop />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(32,38,42,0.36)' }} />

            {recording ? (
              <RecordingView onStop={() => { setMode('photo'); setKind('video'); }} />
            ) : (
              <div className="gv-sheet gv-scroll" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: '12px 18px 26px', boxShadow: '0 -12px 40px rgba(0,0,0,0.18)', maxHeight: '92%', overflowY: 'auto' }}>
                <div style={{ width: 40, height: 5, borderRadius: 999, background: '#dde3df', margin: '0 auto 16px' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 21, fontWeight: 500, letterSpacing: -0.3 }}>Add a photo or video</div>
                  <button className="gv-press" aria-label="Close" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${C.hair}`, background: '#fff', color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{I.close({ s: 15, c: C.muted })}</button>
                </div>
                <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.45, marginBottom: 16 }}>A moment from Oscar’s day, kept for you and your vet.</div>

                {/* attached thumbnail OR the three tiles */}
                {attached ? (
                  <div className="gv-rise" style={{ display: 'flex', gap: 13, alignItems: 'center', background: C.field, border: `1px solid ${C.hairSoft}`, borderRadius: 16, padding: 11, marginBottom: 16 }}>
                    <div style={{ position: 'relative', width: 72, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={kind === 'video' ? 'assets/media-clip-garden.jpg' : 'assets/media-incision-6.jpg'} alt="attached" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {kind === 'video' && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 26, height: 26, borderRadius: 999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 0, height: 0, borderLeft: '8px solid #fff', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', marginLeft: 2 }} /></div></div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700 }}>{kind === 'video' ? 'Clip ready' : 'Photo ready'}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: kind === 'video' ? '#46617d' : 'var(--sage-ink)', background: kind === 'video' ? 'var(--slate-soft)' : 'var(--sage-soft)', padding: '2px 7px', borderRadius: 999 }}>{kind === 'video' ? '0:12' : 'JPEG'}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, lineHeight: 1.35 }}>Tap to retake, or add a caption below.</div>
                    </div>
                    <button className="gv-press" aria-label="Remove" onClick={() => setMode('idle')} style={{ width: 26, height: 26, borderRadius: 999, border: 'none', background: '#fff', color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{I.close({ s: 14, c: C.muted })}</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 9, marginBottom: 16 }}>
                    <Tile icon={I.camera} label="Take photo" accent="var(--sage-soft)" ink="#3a6b60" primary onClick={() => { setKind('photo'); setMode('photo'); }} />
                    <Tile icon={I.video} label="Record a clip" sub="≤ 15 sec" accent="var(--slate-soft)" ink="#46617d" onClick={() => { setKind('video'); setMode('recording'); }} />
                    <Tile icon={I.library} label="Library" accent="var(--teal-soft)" ink="#2f6a62" onClick={() => { setKind('photo'); setMode('photo'); }} />
                  </div>
                )}

                {/* caption */}
                <div style={{ marginBottom: 13 }}>
                  <div style={{ fontSize: 12, fontWeight: 650, color: C.charcoal, marginBottom: 7 }}>Caption</div>
                  <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What is this? e.g. ‘the incision’, ‘his morning walk’" style={{ width: '100%', border: `1px solid ${C.hair}`, borderRadius: 12, background: C.field, padding: '12px 13px', fontSize: 14, fontFamily: 'inherit', color: C.charcoal, outline: 'none' }} />
                </div>

                {/* target chips */}
                <div style={{ marginBottom: kind === 'video' ? 13 : 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 650, color: C.charcoal, marginBottom: 7 }}>Attach to</div>
                  <div style={{ display: 'flex', gap: 7 }}>
                    {TARGETS.map((t, i) => {
                      const on = target === i;
                      return <button key={t} className="gv-press" onClick={() => setTarget(i)} style={{ padding: '8px 13px', borderRadius: 999, cursor: 'pointer', fontSize: 12.5, fontWeight: on ? 700 : 600, border: `1px solid ${on ? C.sage : C.hair}`, background: on ? 'var(--sage-soft)' : '#fff', color: on ? 'var(--sage-ink)' : C.muted, display: 'flex', alignItems: 'center', gap: 5 }}>{on && I.check({ s: 13, c: 'var(--sage-ink)', w: 2.6 })}{i === 0 ? 'Today’s log' : t}</button>;
                    })}
                  </div>
                </div>

                {/* video non-clinical note */}
                {kind === 'video' && (
                  <div className="gv-rise" style={{ display: 'flex', gap: 9, alignItems: 'flex-start', background: 'var(--slate-soft)', border: `1px solid ${C.hairSoft}`, borderRadius: 13, padding: '11px 13px', marginBottom: 16 }}>
                    <span style={{ color: '#46617d', flexShrink: 0, marginTop: 1 }}>{I.video({ s: 15, c: '#46617d' })}</span>
                    <div style={{ fontSize: 11.5, color: '#3c4a57', lineHeight: 1.5 }}>A short clip (≤15s) of Oscar moving. For your records and your vet — Oscar compares clips to Oscar’s <strong style={{ fontWeight: 700 }}>own past clips</strong>, it doesn’t grade his gait.</div>
                  </div>
                )}

                {/* privacy */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
                  {I.lock({ s: 13, c: C.mutedSoft })}
                  <span style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>Private to your account. Stored securely, shared only when you choose.</span>
                </div>

                {/* save */}
                <button className="gv-press" disabled={!attached} style={{ width: '100%', padding: '15px', borderRadius: 15, border: 'none', cursor: attached ? 'pointer' : 'not-allowed', background: attached ? 'linear-gradient(180deg, #59978a, #437a6d)' : '#dbe3df', color: attached ? '#fff' : '#9aa49e', fontSize: 15.5, fontWeight: 700, boxShadow: attached ? '0 6px 16px rgba(63,123,109,0.30)' : 'none' }}>
                  {attached ? 'Save to Oscar’s record' : 'Choose a photo or clip to save'}
                </button>
              </div>
            )}
          </div>
        </IOSDevice>
      </div>
    );
  }

  // ── recording view ──
  function RecordingView({ onStop }) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: '#1a1f22' }}>
        <img src="assets/media-clip-garden.jpg" alt="viewfinder" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.82 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0) 25%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.5))' }} />
        {/* rec pill + timer */}
        <div style={{ position: 'absolute', top: 56, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.45)', borderRadius: 999, padding: '7px 14px', backdropFilter: 'blur(4px)' }}>
            <span className="gv-rec" style={{ width: 9, height: 9, borderRadius: 999, background: '#ff5a4d', animation: 'gv-pulse 1.1s infinite' }} />
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: 0.5 }}>0:08</span>
          </div>
        </div>
        {/* guidance */}
        <div style={{ position: 'absolute', top: 100, left: 24, right: 24, textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(0,0,0,0.4)', borderRadius: 13, padding: '9px 14px', backdropFilter: 'blur(4px)' }}>
            <span style={{ color: '#fff', fontSize: 12.5, lineHeight: 1.4, fontWeight: 500 }}>Walk Oscar slowly across the frame — a few steps is plenty.</span>
          </div>
        </div>
        {/* progress to 15s */}
        <div style={{ position: 'absolute', bottom: 116, left: 40, right: 40 }}>
          <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.3)', overflow: 'hidden' }}>
            <div style={{ width: '53%', height: '100%', background: '#fff', borderRadius: 999 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10.5, fontWeight: 600 }}>0:08</span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10.5, fontWeight: 600 }}>max 0:15</span>
          </div>
        </div>
        {/* stop button */}
        <div style={{ position: 'absolute', bottom: 38, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <button className="gv-press" onClick={onStop} aria-label="Stop recording" style={{ width: 70, height: 70, borderRadius: 999, border: '4px solid rgba(255,255,255,0.85)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: '#ff5a4d', display: 'block' }} />
          </button>
        </div>
      </div>
    );
  }

  window.CaptureApp = CaptureApp;
})();
