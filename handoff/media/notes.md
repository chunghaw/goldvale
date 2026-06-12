# Media — Capture sheet + Visual-recall timeline — notes

**Two related surfaces in one bundle.**
- **Capture sheet** — a bottom sheet opened from the companion chat or daily check-in.
- **Media timeline** — route `/pets/[id]/media`.

**Backend (both):** `media_assets(pet_id, kind, url, caption, embedding vector(1024), recorded_at, journal_entry_id, mention_at_vet)` · S3 presigned upload · Titan multimodal embeddings → pgvector kNN for "similar days" · video self-similarity via `pose_consistency_events` (**never** gait diagnosis).

## Files
- `index.html` — runnable host. A top "surface" switch toggles Media timeline ⇄ Capture sheet (review harness only; in production each mounts on its own route).
- `Capture.jsx` — `window.CaptureApp`. IIFE-wrapped (so it shares the demo page with MediaTimeline without global-scope collisions).
- `MediaTimeline.jsx` — `window.MediaTimelineApp`. Also IIFE-wrapped.
- `ios-frame.jsx` — device bezel only (not product code).
- `assets/` — `oscar.jpg` + abstract placeholders: `media-incision-1..6.jpg` (a 6-week healing series for visual recall), `media-walk.jpg`, `media-rest.jpg`, `media-clip-garden.jpg`, `media-clip-stairs.jpg`. **All are calm, non-graphic stand-ins — replace with real media.**

> Each `*.jsx` exposes its own `window.*App` and is independently mountable. The top "surface" switch and each screen's "Sheet state" switch are review aids — not product UI.

## A · Capture sheet
**Purpose:** add a photo or short clip to Oscar's record. Three tiles: **Take photo · Record a clip (≤15s) · Library**, a **caption** field, and an **"Attach to"** target chip (Today's log / Companion chat / Vet brief). A **privacy** line is always shown.

**States:** `idle` (three tiles, Save disabled) · `photo` (thumbnail + "Photo ready/Clip ready" + caption + targets + Save enabled) · `recording` (full-screen viewfinder, REC timer, ≤15s progress, guidance, stop button).

**Video framing (non-clinical, verbatim):** "A short clip (≤15s) of Oscar moving. For your records and your vet — Goldvale compares clips to Oscar's **own past clips**, it doesn't grade his gait."

| UI element | Field | Notes |
| --- | --- | --- |
| Take photo / Record / Library | capture intent → `media_assets.kind` | `photo \| video` |
| Recording (≤15s cap) | client-side limit | clip duration stored on `media_assets` |
| Caption | `media_assets.caption` | placeholder "What is this? e.g. 'the incision', 'his morning walk'" |
| Attach to | `media_assets.journal_entry_id` (+ chat / brief routing) | default "Today's log" |
| Save | S3 presigned upload → insert `media_assets`; Titan embedding generated server-side | — |
| Privacy line | static | "Private to your account…" |

## B · Media timeline / Visual recall
**Header stat:** "24 photos · 5 clips". Chronological, **date-grouped** grid (Today / This week / Last week…). Each tile shows the media, its **caption**, a **"mention at vet"** flag toggle, and — on eligible photos — a **"Similar days"** affordance. Video tiles show a **play badge + duration**. A summary row tallies flagged items; footer carries the disclaimer.

**Visual recall:** tapping "Similar days" opens a sheet — the same subject over time as a **horizontal dated series** ("The incision, over time · 6 photos over 6 weeks · same spot"), latest highlighted, with a non-clinical line and "Add this series to the vet brief".

| UI element | Field / source | Notes |
| --- | --- | --- |
| Grid tiles | `media_assets` grouped by `recorded_at` | photos + clips |
| Caption | `media_assets.caption` | under each tile |
| Play badge + duration | `media_assets.kind = video` | duration from asset |
| "Mention at vet" flag | `media_assets.mention_at_vet` | toggles; tallied in the summary row → vet brief |
| "Similar days" | Titan embedding → pgvector **kNN** over `media_assets.embedding` | groups the same subject over time |
| Visual-recall series | the kNN neighbours ordered by `recorded_at` | latest = newest |
| Video self-similarity | `pose_consistency_events` | consistency vs the pet's **own** past clips — **never** a gait grade/diagnosis |

## Copy to keep verbatim
- "Oscar's photos & clips"
- "Similar days"
- "Goldvale keeps the record. It doesn't diagnose — your vet reads the full picture."
- Video: "…Goldvale compares clips to Oscar's own past clips, it doesn't grade his gait."

## Non-clinical guardrail
Capture and recall **keep and surface the owner's own media** — Goldvale never interprets an image or clip as a condition. "Similar days" shows the owner's own photos side by side so *they* can see change; video comparison is self-similarity only (`pose_consistency_events`), never a gait diagnosis. Flagged media route to the vet brief; the disclaimer is always visible.
