# Frontend Handoff — claude.ai/design → Oscar

How design work in **claude.ai/design** becomes wired, typed screens in this app. The backend (Aurora schema, domain core, Bedrock adapters) is already built, so anything you design maps onto **real data** — no throwaway work.

## TL;DR — the loop

```
1. You DESIGN a screen in claude.ai/design (use the prompts below).
2. You EXPORT the code and drop it in  design/incoming/<screen>/  (or paste it to me).
3. You tell me  "screen <name> is ready".
4. I INTEGRATE: refactor into components/, type the props from the real DB shapes,
   wire to the API/server actions, keep the brand + non-clinical copy, run tsc/lint,
   commit, and show you the preview. You review.
```

Design and backend proceed **in parallel** — don't wait for one to finish the other.

## What to hand me (and how)

**Preferred — give me the actual code.** claude.ai/design can output **React/TSX + Tailwind** (ideal — this app is Next.js + Tailwind) or **HTML/CSS** (also fine, I'll convert). For each screen:

1. Export/copy the component code.
2. Save it in the repo at **`design/incoming/<screen-name>/`** (e.g. `design/incoming/daily-checkin/page.tsx`). Include any extra files it gives (a `globals` snippet, sub-components).
3. Add a one-line `notes.md` if there are interactions/states worth calling out (e.g. "insight card appears after submit").
4. Tell me the screen is ready.

**Alternative:** paste the code straight into chat (fine for small screens).

**Won't work:** a claude.ai/design *share link* — that's your private project; I can't read it. I need the **code or markup**, not a link. A screenshot alone is a weak fallback (I can rebuild from it, but it's slower and less faithful).

**For each screen, include:** the code · which screen it is · the key states (empty / filled / the revealed insight card) · any copy you want kept verbatim. Don't worry about real data, logic, or wiring — that's my job.

## What I do on my side

For every incoming screen I:
- Extract a clean **presentational component** into `components/` (brand tokens, responsive, accessible).
- **Type its props** from the real backend shapes (`lib/db/schema.ts`) so the data contract is exact.
- Wire data via **server components / route handlers / server actions** (DB + Bedrock stay server-side).
- Enforce the **non-clinical guardrail** on any model copy (`narrateSafe`), and keep red-flag elements routing to the vet.
- Run `npx tsc --noEmit` + `npm run test` + lint, commit, and give you a preview to review.

## Screen → route → real data

| Screen | Route | Backend it connects to |
| --- | --- | --- |
| Onboarding / add pet | `/onboarding` | `owners`, `pets`, medication schedule |
| **Daily check-in** (hero) | `/pets/[id]/checkin` | `daily_checkins`, `medication_events`, `exercise_session_events`; insight card = pgvector recall over `journal_entries` / `mobility_score_events` |
| **Dashboard** (trend + recall) | `/pets/[id]` | mobility trend (`rolling_baseline_mv`), `adherence_rollup_mv`, `bcs_mcs_events`; "resembles a past flare" recall |
| Exercise track | `/pets/[id]/exercises` | `exercise_plans` + `plan_items` + `exercises`; tolerance → `exercise_session_events`; progression nudge (`lib/domain/progression`) |
| **Vet-prep brief** | `/pets/[id]/brief` | aggregation across the time-series + pgvector analogues + literature RAG (`literature_chunks`) + `rehab_providers` referral |

## Brand tokens (so designs + code match)

| Token | Value | Use |
| --- | --- | --- |
| Background | `#FBF7EF` (warm cream) | page background |
| Text | `#2A2622` (warm charcoal) | body text |
| Primary | `#E0A526` (gold/amber) | key actions, highlights — **used sparingly** |
| Positive | `#5B8C82` (sage) | steady/improving trends |
| Danger | red — **only** the bounded "contact your vet now" element |
| Radius | ~18px | cards |

I can wire these into `app/globals.css` as Tailwind v4 theme tokens so your exported classes and my components share one source of truth — say the word.

## Priority order

Design the **3 demo-critical screens first** (your <3-min demo *is* these): **① Daily check-in → ② Dashboard → ③ Vet-prep brief**, then Onboarding + Exercise track. Run the **brand prompt once**, then one screen per prompt, asking for **mobile frames**. The prompts are in our chat (brand + 5 screens).
