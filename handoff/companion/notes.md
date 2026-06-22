# AI Companion chat — notes

**Route:** `/pets/[id]/companion`
**Backend:** `chat_threads`, `chat_messages(role, text, media_url)`, `media_assets(kind photo|video, url, caption)`. Agent replies stream from **Bedrock Claude (multimodal)** and **always pass `narrateSafe`**; tools write `journal_entries`, append vet-brief questions, and run pgvector recall. Red flags route via `red_flag_rules`.

## Files
- `index.html` — runnable host (React 18 + Babel CDN). Open directly in a browser.
- `Companion.jsx` — the screen. Presentational; one hardcoded demo conversation per state.
- `ios-frame.jsx` — device bezel only (not product code).
- `assets/oscar.jpg` — demo pet avatar (placeholder).
- `assets/incision-demo.jpg` — abstract neutral stand-in for an owner-sent "incision" photo (placeholder — NOT a real wound image).

> **Demo aid:** a "Demo state" segmented control sits *above* the device (Intro / Conversation / Red flag). It is **not** product UI — delete `<StateSwitcher>` on integration. The real thread renders from `chat_messages`.

## The cardinal rule (voice)
Oscar is a **companion + scribe + vet-prep assistant** — it never diagnoses, grades, stages, or prescribes. It logs what you tell it, recalls your own past notes, narrates your own trends, and routes anything concerning to your vet. Every agent reply is written in that voice and **must pass `narrateSafe`** before it streams. A slim disclaimer is pinned under the input at all times.

## States
1. **Empty / intro** — warm greeting bubble + 4 suggestion chips: "How's Oscar's week?", "Log a symptom", "Add a photo of the incision", "Help me prep for the vet". Tapping a chip drops it into the input.
2. **Conversation** — owner text bubble (right, sage); owner bubble with a **photo thumbnail**; a Oscar reply embedding a **"✓ Logged to Oscar's journal"** chip + a **pattern-memory recall card**; a second reply with an **"＋ Added to vet brief"** chip; and the **typing indicator** (three pulsing dots).
3. **Red flag** — owner describes something worrying; Oscar replies with the bounded **"Contact your vet now"** alert card (danger) and a calm, non-diagnostic line.

## Rich cards (embedded in Oscar bubbles)
| Card | Trigger | Writes to |
| --- | --- | --- |
| ✓ Logged to Oscar's journal (sage chip) | agent logs an observation | `journal_entries` |
| ＋ Added to vet brief (clay chip) | agent flags an item for the visit | vet-brief questions |
| Pattern memory recall (2–3 dated chips) | pgvector recall of the owner's own notes | read-only recall |
| Mobility mini-sparkline (`MobilityMiniCard`) | narrating the owner's own trend | `mobility_score_events` (read) |
| Contact your vet now (danger alert) | red-flag / emergency reply | `red_flag_rules` routing |

## Message / input mapping
| UI element | Field / source | Notes |
| --- | --- | --- |
| Owner bubble (right, sage) | `chat_messages` role `owner` | text and/or `media_url` |
| Owner photo thumbnail | `media_assets(kind=photo, url, caption)` | shown inside the owner bubble |
| Oscar bubble (left, white) | `chat_messages` role `assistant` | streamed from Bedrock; `narrateSafe` |
| Typing indicator | streaming state | three pulsing dots |
| Attach ＋ → Photo / Video / Library | opens media picker → `media_assets` | thumbnail chip shows above input pre-send |
| Text field + send | inserts `chat_messages` | placeholder "Tell Oscar about Oscar…" |
| Persistent disclaimer | static | always visible under input |

## Copy to keep verbatim
- Greeting: "I'm here to help you keep track of Oscar and get ready for the vet. I can't diagnose — but I remember everything, so you don't have to."
- On logging: "Noted — I've saved that to today's journal."
- On a photo: "Thanks — I've saved this to Oscar's log. I can't assess it, but redness, heat, or discharge are worth your vet seeing. Want me to flag it for the visit?"
- Red flag: "That can't wait for me — please contact your vet now."
- Disclaimer: "Oscar remembers and prepares — it doesn't diagnose. Your vet decides."

## Non-clinical guardrail
The agent logs, recalls, and narrates the owner's **own** data; it never interprets an image or a symptom as a condition. Photo replies explicitly decline to assess and offer to flag for the vet. Red flags hand off to the vet with a non-diagnostic line. `narrateSafe` is mandatory on every streamed reply.
