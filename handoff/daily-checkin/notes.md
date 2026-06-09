# Daily check-in — notes

**Route:** `/pets/[id]/checkin`
**Backend:** `daily_checkins`, `medication_events`, `exercise_session_events`; insight card = pgvector recall over `journal_entries` / `mobility_score_events`.

## Files
- `index.html` — runnable host (React 18 + Babel CDN). Open directly in a browser.
- `Checkin.jsx` — the screen. All presentational; data is hardcoded demo state to be replaced with real props.
- `ios-frame.jsx` — device bezel only (starter scaffold; drop at integration, it is not part of the product).
- `assets/oscar.jpg` — demo pet photo (placeholder — swap for the real pet's avatar URL).

## States to preserve
1. **Empty** — Save button disabled, reads "Tap a face to start". Nothing is required except the QoL face to enable submit.
2. **Filling** — completion meter in the header fills as the 5 sections get touched (QoL, movement, rehab, meds, note).
3. **Rehab tolerance reveal** — checking an exercise reveals its 4 tolerance pills inline (animated in).
4. **Submitted → insight** — replaces the form with the confirmation + the gentle pattern-memory card. "Back to today's check-in" returns to the form.

## Field mapping
| UI element | Field / source | Values |
| --- | --- | --- |
| QoL 5-face scale | `daily_checkins.qolScore` | HHHHHMM 5-point, 0–4 (Hard→Bright) |
| Today's movement check (2 rotating items) | `daily_checkins.mobilityItems` (JSON) | subset of the 24 GenPup-M items; options `Easily / A bit harder / Much harder / Couldn't` |
| Rehab checkoff | `exercise_session_events` (one row per exercise done) | exercises from `plan_items` → `exercises` |
| Tolerance pills | `exercise_session_events.tolerance` | enum `handled / a_bit_tired / sore / refused` — verbatim from `lib/domain/progression.ts` |
| Medication toggles | `medication_events.given` | boolean per scheduled med |
| Note textarea | `daily_checkins.note` → `journal_entries` | free text |
| Save button | server action: insert `daily_checkins` + child events | — |
| Pattern-memory insight | pgvector recall over `journal_entries` / `mobility_score_events` | narrative must pass `narrateSafe` |
| "Contact your vet now" | bounded danger element → vet routing | per `lib/domain/guardrails.ts` |

## Copy to keep verbatim
- Consolation banner: "However today went, you're here for Oscar. A few quick notes is all today needs."
- Insight: "Slower rising has shown up 3 times in 2 weeks." / "A pattern worth mentioning at your next vet visit."
- Confirmation: "You showed up for Oscar."

## Non-clinical guardrail
The insight is **recall, not diagnosis** — it surfaces what was logged and frames it as "worth mentioning to your vet". Keep that framing through `narrateSafe`. Never assert a cause.
