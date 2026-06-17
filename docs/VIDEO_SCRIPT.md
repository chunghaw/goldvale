# Goldvale — demo video script (≤3 min)

**Target:** ~2:15. Voiceover ~250 words (clean TTS — test it first; if it sounds robotic, slow it ~5%). Show the app working; land the database moment once. Don't read the README.

**Before you record:** reseed the demo so it's pristine —
`npx tsx --env-file=.env scripts/seed-demo-pet.ts` (re-embeds vectors + re-seeds media), and delete Oscar's `chat_threads` row so the companion opens clean. Record the phone-frame view (desktop, window ≥600px wide) for the iPhone presentation.

---

### Beat 1 — Hook / the problem  (0:00–0:22)
**Screen:** Landing page (`/`), slow zoom; then the "Explore the live demo" tap.
**VO:** "If you've cared for an aging dog, or a cat with a chronic condition, you know the hardest part isn't the vet visit — it's the months in between. The slow decline you're tracking at home, hoping you'll catch the pattern in time."

### Beat 2 — What it is + the daily check-in  (0:22–0:45)
**Screen:** Oscar's dashboard, then tap into the **daily check-in** — show the mood faces and the rotating mobility items.
**VO:** "Goldvale is a calm daily companion and home-rehab tracker for those pets. It starts with a twenty-second check-in — how they're moving, how they're doing."

### Beat 3 — The trend + the non-clinical decision  (0:45–1:08)
**Screen:** Back to dashboard; the **mobility trend** chart (tap a point to show the score; the line rises).
**VO:** "That trends a validated mobility score over time. And here's a deliberate choice: every clinical number is computed by plain, deterministic code — never the language model. The AI only narrates what the data already says."

### Beat 4 — THE DATABASE MOMENT  (1:08–1:50)  ← the peak
**Screen:** Flash the **architecture diagram** (2 sec), then the **pattern-memory recall** screen — let the **% match** numbers sit on screen — then the **media "Similar days"** overlay with the incision series side by side.
**VO:** "Now, the engineering. A senior pet's health record is relational, time-series, *and* semantic — all at once. So Goldvale keeps every bit of it in one Aurora Postgres instance with pgvector. When a stiff morning shows up, it searches the pet's own journal by meaning — *this flare resembles one from five weeks ago.* And it does the same with photos: *compare today's incision to last month.* Two kinds of similarity search — text and image — as plain SQL on the same rows. No second database, no sync."

### Beat 5 — Companion + vet brief + safety  (1:50–2:15)
**Screen:** The **companion chat** (send a message, a reply with a card appears), then the **vet brief**, then the **"Contact your vet now"** screen.
**VO:** "An AI companion on Amazon Bedrock ties it together — it logs what you tell it, recalls the history, and packages a cited, vet-ready brief. But it never diagnoses. Every line is checked, and anything worrying routes straight to your vet."

### Beat 6 — Close  (2:15–2:25)
**Screen:** Architecture diagram held, or the landing logo.
**VO:** "One Aurora backend, four load-bearing layers, doing real work on every request. Goldvale supports the vet's plan — it never replaces it."

---

## The exact click-path to screen-record
1. `/` landing → **Explore the live demo**
2. Dashboard → **Daily check-in** (tap a face + a movement item) → back
3. Dashboard → tap a **mobility chart** point
4. Dashboard → **Days like this** (pattern recall — hold on the % matches)
5. Dashboard → **Photos & clips** → tap **Similar days** on an incision photo (the healing series)
6. Dashboard → **Talk to Goldvale** → tap a suggestion chip → send → reply card
7. Dashboard → **Prepare a vet brief**
8. Any **Contact your vet now** link → the escalation screen

## Notes
- **One DB sentence on screen** (optional lower-third over Beat 4): *"Relational + time-series + text-vector + image-vector — one Aurora instance."*
- Keep cuts quick; let the **% match numbers** and the **incision side-by-side** breathe — those are the "look what one query does" shots.
- End screen: live URL `goldvale.vercel.app` + repo + "#H0Hackathon".
