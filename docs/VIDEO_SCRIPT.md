# Oscar — demo video script (≤3 min)

**Target:** ~2:15. Voiceover ~250 words (clean TTS — test it first; if it sounds robotic, slow it ~5%). Show the app working; land the database moment once. Don't read the README.

**Before you record:** reseed the demo so it's pristine —
`npx tsx --env-file=.env scripts/seed-demo-pet.ts` (re-embeds vectors + re-seeds media), and delete Oscar's `chat_threads` row so the companion opens clean. Record the phone-frame view (desktop, window ≥600px wide) for the iPhone presentation.
Demo pet id `a0c5ca9e-0000-4000-8000-000000000001` · base `https://oscarcare.vercel.app` — the exact URL for each beat is on its **URL:** line below. All verified 200.

---

### Beat 1 — Hook / the problem  (0:00–0:22)
**Screen:** Open on the title slide (`docs/slides/opening.html`), then the landing page, slow zoom; then the "Explore the live demo" tap.
**URL:** https://oscarcare.vercel.app/
**VO:** "If you've ever looked after an old dog, or a cat who isn't quite who she used to be, you know the hardest part isn't the vet visit. It's the long stretch in between — watching them slow down at home, hoping you'll notice the thing that matters before it slips by."

### Beat 2 — What it is + the daily check-in  (0:22–0:45)
**Screen:** Oscar's dashboard, then tap into the **daily check-in** — show the mood faces and the rotating mobility items.
**URL:** dashboard `https://oscarcare.vercel.app/pets/a0c5ca9e-0000-4000-8000-000000000001` → check-in `https://oscarcare.vercel.app/pets/a0c5ca9e-0000-4000-8000-000000000001/checkin`
**VO:** "So I built Oscar. It's a gentle, twenty-second check-in you do each day — just how they're moving, how they seem in themselves. I named it after a real dog who needed exactly this."

### Beat 3 — The trend + the non-clinical decision  (0:45–1:08)
**Screen:** Back to dashboard; the **mobility trend** chart (tap a point to show the score; the line rises).
**URL:** https://oscarcare.vercel.app/pets/a0c5ca9e-0000-4000-8000-000000000001
**VO:** "Those small daily notes add up to a real picture of how they're doing, week by week. And one thing I was careful about: the actual scoring is done by plain, ordinary code — never the AI. The AI doesn't decide anything medical. It just helps you see what's already there."

### Beat 4 — THE DATABASE MOMENT  (1:08–1:50)  ← the peak
**Screen:** Flash the **architecture diagram** (2 sec), then the **pattern-memory recall** screen — let the **% match** numbers sit on screen — then the **media "Similar days"** overlay — Oscar's matching days side by side.
**URL:** diagram `docs/architecture.svg` → recall `https://oscarcare.vercel.app/pets/a0c5ca9e-0000-4000-8000-000000000001/recall` → media `https://oscarcare.vercel.app/pets/a0c5ca9e-0000-4000-8000-000000000001/media`
**VO:** "Here's the part I'm proud of. A pet's history is a few things at once — facts, changes over time, and the kind of memory you can't put in a number. Most apps would reach for three different databases. Oscar keeps all of it in one — Aurora Postgres, with pgvector. So when a rough morning comes, it can search his own history by meaning: this feels like that hard week back in spring. It does the same with photos — pulling up the days he was moving like this one. Words and pictures, both searchable, all in one place."

### Beat 5 — Companion + vet brief + safety  (1:50–2:15)
**Screen:** The **companion chat** (send a message, a reply with a card appears), then the **vet brief**, then the **"Contact your vet now"** screen.
**URL:** companion `https://oscarcare.vercel.app/pets/a0c5ca9e-0000-4000-8000-000000000001/companion` → brief `https://oscarcare.vercel.app/pets/a0c5ca9e-0000-4000-8000-000000000001/brief` → vet-contact `https://oscarcare.vercel.app/pets/a0c5ca9e-0000-4000-8000-000000000001/vet-contact`
**VO:** "There's a companion you can just talk to — built on Amazon Bedrock — that remembers what you tell it, brings back the history, and quietly puts together everything your vet should see. It will never tell you what's wrong; that was never its job. If something looks worrying, it points you straight to your vet."

### Beat 6 — Close  (2:15–2:25)
**Screen:** End on the closing slide (`docs/slides/ending.html`), or hold the architecture diagram.
**On screen:** live **oscarcare.vercel.app** · repo **github.com/chunghaw/oscar** · **#H0Hackathon**
**VO:** "One database, quietly doing the work of four. Oscar doesn't replace your vet — it just helps you walk in knowing more. For Oscar — and every old friend like him."

---

## Notes
- **One DB sentence on screen** (optional lower-third over Beat 4): *"Relational + time-series + text-vector + image-vector — one Aurora instance."*
- Keep cuts quick; let the **% match numbers** and the **incision side-by-side** breathe — those are the "look what one query does" shots.
- Bonus screen if time allows — the vet-gated exercise track: `https://oscarcare.vercel.app/pets/a0c5ca9e-0000-4000-8000-000000000001/exercises`
- **Submission-form metadata** (not on screen): Vercel Team ID `team_1NrzZKgn3I3Rh1M8ZHukgoOw`; screenshots in `docs/screenshots/`; full paste-ready blurb in `docs/SUBMISSION.md`.
