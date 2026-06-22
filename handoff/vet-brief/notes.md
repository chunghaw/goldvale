# Vet-prep brief — notes

**Route:** `/pets/[id]/brief`
**Backend:** aggregation across the time-series + pgvector analogues + literature RAG (`literature_chunks`) + `rehab_providers` referral.

## Files
- `index.html` — runnable host. Open directly in a browser.
- `VetBrief.jsx` — the screen. Presentational; data is hardcoded demo state.
- `ios-frame.jsx` — device bezel only (not product code).
- `assets/oscar.jpg` — demo pet photo (placeholder).

## States to preserve
- **Things to mention** are toggleable — each row includes/excludes from the brief. The hero stat chip ("N of 3 to mention") updates live with the count.
- **Questions to ask** is owner-editable — typing + Enter (or the + button) appends a question.
- **Share button** flips to a confirmed state ("Brief ready to share") on tap.

## Field mapping
| UI element | Field / source | Notes |
| --- | --- | --- |
| Things to mention | curated aggregation, owner toggles in/out | items are auto-surfaced, owner curates: |
| — Mobility +8 | mobility delta vs baseline (`mobility.ts`, MCID=8) | "Trend" |
| — Slower rising 3× | pgvector pattern recall over `daily_checkins.mobilityItems` | "Pattern" |
| — Ready to progress? | `lib/domain/progression.ts` nudge | "Question" — stays a question |
| 28-day snapshot | mobility score · avg `qolScore` · `adherence_rollup_mv` | tabular figures |
| Current medications + adherence | `medication_events` → `adherence_rollup_mv` | "27 / 28 days" style |
| Questions to ask | owner-entered (new column, e.g. `brief.questions[]`) | seeded + appendable |
| Share brief with vet | export/share action; may attach `literature_chunks` + `rehab_providers` referral | — |
| Footer disclaimer | static | non-clinical line |

## Copy to keep verbatim
- Hero: "Brief for Dr. Okafor" / "Oscar's vet brief"
- Footer: "Oscar prepares and remembers. It doesn't diagnose — your vet reads the full picture."

## Non-clinical guardrail
The brief **assembles what was observed** and the owner curates it. No item asserts a diagnosis; the progression item is a question; the share action hands the vet a record, not a recommendation.
