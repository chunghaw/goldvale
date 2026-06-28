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
Those small daily notes add up to a real picture of how they're doing, week by week. And one thing I was careful about: the actual scoring is done by plain, ordinary code — never the AI. The AI doesn't decide anything medical. It just helps you see what's already there.

[Beat 4 · 1:08–1:50 · ≈42s — the database moment]
Here's the part I'm proud of. A pet's history is a few things at once — facts, changes over time, and the kind of memory you can't put in a number. Most apps would reach for three different databases. Oscar keeps all of it in one — Aurora Postgres, with pgvector. So when a rough morning comes, it can search his own history by meaning: this feels like that hard week back in spring. It does the same with photos — pulling up the days he was moving like this one. Words and pictures, both searchable, all in one place.

[Beat 5 · 1:50–2:15 · ≈25s]
There's a companion you can just talk to — built on Amazon Bedrock — that remembers what you tell it, brings back the history, and quietly puts together everything your vet should see. It will never tell you what's wrong; that was never its job. If something looks worrying, it points you straight to your vet.

[Beat 6 · 2:15–2:25 · ≈10s]
One database, quietly doing the work of four. Oscar doesn't replace your vet — it just helps you walk in knowing more. For Oscar — and every old friend like him.
