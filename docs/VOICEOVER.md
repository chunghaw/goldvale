# Oscar — ElevenLabs voiceover script

Paste the block below into ElevenLabs. ~250 words → ~1:45–2:00 of speech. The per-beat
timestamps match `docs/VIDEO_SCRIPT.md` exactly, so each VO line lands on its screen action.
Demo runtime ~2:25 (the visuals breathe between lines); with the opening/closing slides it
stays under 3:00.

**Suggested voice + settings:** a calm, warm narrator (not a hype promo voice).
Stability ~50 · Similarity ~75 · Style low. If it sounds robotic, slow ~5%.

**Tip:** render per-beat (the `[Beat n]` markers) so you can sync each line to its screen
action and redo one beat without re-rendering everything. The `≈Ns` is that beat's on-screen
window — if a generated line runs long, trim a few words rather than rush the read. Remove
the `[Beat n · …]` markers before generating if you want one continuous take.

---

[Beat 1 · 0:00–0:22 · ≈22s]
If you've cared for an aging dog, or a cat with a chronic condition, you know the hardest part isn't the vet visit — it's the months in between. The slow decline you're tracking at home, hoping you'll catch the pattern in time.

[Beat 2 · 0:22–0:45 · ≈23s]
Oscar is a calm daily companion and home-rehab tracker for those pets. It starts with a twenty-second check-in — how they're moving, how they're doing.

[Beat 3 · 0:45–1:08 · ≈23s]
That trends a validated mobility score over time. And here's a deliberate choice: every clinical number is computed by plain, deterministic code — never the language model. The AI only narrates what the data already says.

[Beat 4 · 1:08–1:50 · ≈42s — the database moment]
Now, the engineering. A senior pet's health record is relational, time-series, and semantic — all at once. So Oscar keeps every bit of it in one Aurora Postgres instance with pgvector. When a stiff morning shows up, it searches the pet's own journal by meaning — this flare resembles one from five weeks ago. And it does the same with photos — lining up the days he was moving like this, weeks apart. Two kinds of similarity search, text and image, as plain SQL on the same rows. No second database, no sync.

[Beat 5 · 1:50–2:15 · ≈25s]
An AI companion on Amazon Bedrock ties it together — it logs what you tell it, recalls the history, and packages a cited, vet-ready brief. But it never diagnoses. Every line is checked, and anything worrying routes straight to your vet.

[Beat 6 · 2:15–2:25 · ≈10s]
One Aurora backend, four load-bearing layers, doing real work on every request. Oscar supports the vet's plan — it never replaces it.
