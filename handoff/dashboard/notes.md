# Dashboard — notes

**Route:** `/pets/[id]`
**Backend:** mobility trend (`rolling_baseline_mv`), `adherence_rollup_mv`, `bcs_mcs_events`; "resembles a past flare" recall via pgvector.

## Files
- `index.html` — runnable host. Open directly in a browser.
- `Dashboard.jsx` — the screen. Presentational; data is hardcoded demo state.
- `ios-frame.jsx` — device bezel only (not product code).
- `assets/oscar.jpg` — demo pet photo (placeholder).

## States to preserve
- **Mobility chart** animates its line on mount (stroke-dashoffset draw). Honors `prefers-reduced-motion` (line shown instantly).
- **Recovery timeline** shows completed phases (check), the current phase ("You are here"), and a future gold milestone.
- All "Add to vet brief" / CTA buttons route forward; no destructive states.

## Field mapping
| UI element | Field / source | Notes |
| --- | --- | --- |
| Mobility trend chart | `mobility_score_events` → `rolling_baseline_mv` | GenPup-M total **0–108, higher = worse**. Score = `computeMobilityScore()` in `lib/domain/mobility.ts` (deterministic, never the LLM) |
| "8 better than baseline" pill | current vs the pet's own baseline | the **8-point MCID** threshold lives in `mobility.ts`; only surface "meaningful" when `|delta| ≥ MCID` |
| Band label ("Mild") | `mobility.ts` bands | none 0–27 · mild 28–54 · moderate 55–82 · severe 83–108 |
| The week in mood | `daily_checkins.qolScore`, last 7 | face glyph reused from check-in |
| A gentle milestone (progression) | `lib/domain/progression.ts` | nudge fires at **6 clean sessions spanning ≥14 days**; copy stays a **question**, never an auto-advance |
| Pattern memory | pgvector recall | same recall as the check-in insight |
| Recovery plan timeline | condition protocol (TPLO) in `lib/db/seed-data.ts` | phases + the week-8 radiograph milestone |
| "Prepare a vet brief" | link → `/pets/[id]/brief` | — |
| "Contact your vet now" | bounded danger element → vet routing | `guardrails.ts` |

## Copy to keep verbatim
- "An 8-point improvement vs Oscar's own baseline — past the 8-point mark Goldvale treats as meaningful. Worth mentioning at your next visit, not a diagnosis."
- Progression: "That can be a sign she's ready for a little more. It's your vet's call — want to raise it with Dr. Okafor?"

## Non-clinical guardrail
Every trend is **relative to the pet's own baseline**, labelled with the band, and never interpreted as a condition. The progression nudge is a question routed to the owner/vet, not an instruction.
