# Oscar — ElevenLabs voiceover script

Paste the block below into ElevenLabs. The per-beat timestamps match `docs/VIDEO_SCRIPT.md`
exactly, so each line lands on its screen action. Demo runtime ~2:25; with the opening and
closing slides it stays under 3:00.

**Delivery:** read it like you're telling a friend about an old dog you loved — unhurried,
warm, a little tender. Not a product pitch. Pick a natural, gentle voice; Stability ~55 ·
Similarity ~75 · Style low. If it sounds clipped or robotic, slow it ~5% and let the dashes
breathe.

**Tip:** render per-beat (the `[Beat n]` markers) so you can sync each line to its screen
action and redo one beat without re-rendering everything. The `≈Ns` is that beat's on-screen
window — if a line runs long, trim a few words rather than rush the read. Remove the
`[Beat n · …]` markers before generating if you want one continuous take.

---

[Beat 1 · 0:00–0:22 · ≈22s]
If you've ever looked after an old dog, or a cat who isn't quite who she used to be, you know the hardest part isn't the vet visit. It's the long stretch in between — watching them slow down at home, hoping you'll notice the thing that matters before it slips by.

[Beat 2 · 0:22–0:45 · ≈23s]
So I built Oscar. It's a gentle, twenty-second check-in you do each day — just how they're moving, how they seem in themselves. I named it after a real dog who needed exactly this.

[Beat 3 · 0:45–1:08 · ≈23s]
Do that for a couple of weeks, and those little notes become something you can see — a simple line that shows whether they're holding steady, or slipping. Same check, same maths, every day — so the trend you're looking at is real, not a guess.

[Beat 4 · 1:08–1:50 · ≈42s — the database moment]
Here's the part I'm proud of. Everything about a pet comes in different shapes — his meds and his rehab plan, how he's moved day by day, and the fuzzy stuff: a rough morning that reminds you of one weeks ago. Normally you'd need three different databases for that. Oscar keeps it all in one — Aurora Postgres, with pgvector. So I can ask it, in plain words, when something happened before — and it finds the match. Same with photos: it pulls up the days he was moving like this one. Words and pictures, both searchable, in one place.

[Beat 5 · 1:50–2:15 · ≈25s]
And there's a companion you can just talk to — it runs on Amazon Bedrock. Tell it what you saw, and it remembers — it pulls up the history and builds the summary your vet actually needs. It won't guess what's wrong with him; that's the vet's job, not a chatbot's. If something sounds serious, it says so, and sends you straight to your vet.

[Beat 6 · 2:15–2:25 · ≈10s]
One database, quietly doing the work of four. Oscar doesn't replace your vet — it just helps you walk in knowing more. For Oscar — and every old friend like him.
