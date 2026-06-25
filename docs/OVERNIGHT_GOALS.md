# OVERNIGHT_GOALS.md — autonomous improvement session

> Generated from a reviewer pass on 2026-06-25. Work these in priority order.
> **Append a one-line progress entry to the log at the bottom after every commit.**

## Operating rules (read first)

1. Read `AGENT_HANDOFF.md` + `CLAUDE.md` before touching code. The **cardinal rule is NON-CLINICAL** — clinical scores live in `lib/domain` (deterministic), the LLM only narrates; every model output passes `assertNonClinical()` / `narrateSafe()`.
2. Work on a branch: `git switch -c overnight/goals`. **Do NOT push and do NOT deploy** — leave `main` and the live Vercel demo untouched. Edmund reviews + merges in the morning.
3. **Definition of Done per item:** `npx tsc --noEmit` clean · `npx vitest run` green · `npm run lint` + `npx next build` green · non-clinical guardrail intact. Then `git commit` that one item with a clear message. One item = one commit.
4. After implementing each item, run the `reviewer-codex` agent (or `scripts/codex-review.ps1`) on the diff; address blocking findings before committing.
5. If an item is genuinely blocked (needs a live Aurora/Bedrock connection you can't reach, or a product decision), **write the blocker into the log and move to the next item** — never stall waiting for input.
6. Add or extend a **test** for every behavioural fix. Pure logic (`lib/domain`, `lib/data` shaping) gets unit tests; don't require network.

## P1 — Real bugs (do first)

### 1. Frozen "today" breaks live (non-demo) accounts
- `lib/data/queries.ts:54` and `lib/data/media.ts:11` hardcode `const NOW = new Date("2026-06-09T09:00:00Z")`.
- Correct for the **seeded demo pet** (its data is anchored to that date). Wrong for any pet a user creates — their "this week"/streak/"X days ago" compute against a frozen date.
- **Goal:** demo pet (`OSCAR_PET_ID` / `DEMO_PET_ID` in `lib/data/ids.ts`) keeps the frozen date; every other pet uses real `new Date()`. Thread a `now` through `getPetView`/the query functions rather than a module constant. Keep seed scripts on the frozen date.
- Add a test proving a non-demo pet's "now" is live and the demo pet's is frozen.

### 2. Materialized views go stale after a live check-in
- `adherence_rollup_mv` / `rolling_baseline_mv` are refreshed by `scripts/seed-demo-pet.ts` but NOT by `lib/data/checkin-write.ts` (`persistCheckin`).
- **Goal:** `REFRESH MATERIALIZED VIEW CONCURRENTLY` for both after a successful check-in write (or document why a trigger is better and add it to `db/schema.sql`). Guard against the CONCURRENTLY-needs-unique-index requirement.

### 3. Companion agent has no error boundary
- `lib/actions/companion.ts` and the tool executors in `lib/ai/companion.ts` (`logToJournal`, `recallPastNotes`, `addVetBriefQuestion`, `escalateToVet`) don't wrap `runCompanion`/`embedText`/DB inserts. A Bedrock or DB hiccup throws to the client mid-chat.
- **Goal:** try/catch in the action (persist a safe fallback assistant message) + per-tool try/catch that returns a graceful result instead of throwing. Fallback copy must pass `assertNonClinical`.

## P2 — Security / data integrity

### 4. `getSimilarMedia` reference lookup not scoped to the pet
- `lib/data/media.ts:78` — the inner lookup of the reference embedding isn't constrained to `pet_id = petId`. Add `and pet_id = ${petId}` (defense-in-depth even though `requirePetAccess` gates the route).

### 5. Missing FK constraints on partitioned event tables
- `exercise_session_events` (and the medication/check-in event tables) carry `pet_id`/`exercise_id` with no `REFERENCES` in `db/schema.sql` → orphan rows survive pet deletion.
- **Goal:** add FKs (partitioned tables can reference parents) with sensible `ON DELETE`. Add a migration script under `scripts/` consistent with existing `migrate-*.ts`.

### 6. Unbounded text inputs
- Companion tool Zod schemas (`lib/ai/companion.ts`) and check-in notes (`lib/data/checkin-write.ts`) accept `z.string()` with no `.max()`.
- **Goal:** cap lengths (journal/notes ~2000, query ~500) to bound embedding cost + injection surface. Trim + reject overlong at the action boundary with a friendly message.

## P3 — Guardrail robustness (the cardinal rule)

### 7. Banned-pattern fragility
- `lib/domain/guardrails.ts` word-boundary patterns miss evasions: "consistent with", "resembles", "typical of", "suspect", past-tense "had arthritis", "undiagnosed".
- **Goal:** extend `BANNED_PATTERNS` + add an **adversarial test corpus** in `guardrails.test.ts` (a parameterized case per pattern + a list of tricky phrasings that must be blocked, and safe phrasings that must pass). This is the highest-liability rule — over-test it.

### 8. Missing access-control + empty-pet tests
- No test proves a logged-in owner can't read another owner's pet, nor that a pet with zero check-ins/exercises renders cleanly (band `none`, empty series, no NaN).
- **Goal:** add both (the access test can target `ownerOwnsPet`/`requirePetAccess` logic without network).

## P4 — UI/UX & accessibility (Design = 1 of 4 equal judging axes)

### 9. No global `:focus-visible`
- QoL faces, mobility options, rep counters, icon-only buttons (send/attach/remove) have no visible keyboard focus ring.
- **Goal:** global `:focus-visible` rule in `app/globals.css` using `--sage` (outline + offset). Verify it reads well on both light cards and the hero gradient.

### 10. Loading / error recovery gaps
- Dashboard has no skeleton; `CompanionScreen` error has no **Retry**; `MediaTimelineScreen` visual-recall fails silently; `VetBriefScreen` "Share" sets a UI flag with no real confirmation.
- **Goal:** add skeletons + a Retry affordance on the companion error + a spinner/error on visual recall. Add `role="alert"`/`aria-live="polite"` to toasts and the typing indicator.

### 11. Form validation is button-only
- Check-in + onboarding signal "why disabled" only via button text. QoL faces are buttons, not a `role="radio"` group; the recovery timeline is divs, not an `<ol>` with `aria-current="step"`.
- **Goal:** field-associated validation messages (`role="alert"`) + radio/list semantics. Keep the calm visual design.

### 12. Mobile overflow
- Hero `whiteSpace: nowrap` truncates long pet names <320px; media grid is fixed `1fr 1fr`; tolerance pills don't wrap; chat bubbles can exceed the viewport.
- **Goal:** allow wrap, `repeat(auto-fit, minmax(140px,1fr))`, `clamp()` bubble widths. Don't regress the desktop look.

### 13. Contrast misses (WCAG AA)
- Muted `#687069` on field `#f2f5f3` (~4.2:1) and placeholders (~3.4:1) fail AA.
- **Goal:** darken the muted token (e.g. `#5a6359`) in `app/globals.css`; re-check the screens still feel calm, not heavy.

## Cleanups (fast, do if time remains)

- `escalateToVet` declares an unused `reason` param (`lib/ai/companion.ts`) — consume or drop it.
- Pattern-memory "shown up **1 times** in 1 week" grammar (`lib/data/queries.ts:390`) — singularize.
- Partitions hardcoded to 2026 months in `db/schema.sql` → everything past Aug 2026 falls to `_default`. Either add `pg_partman` or document the manual-roll requirement in `db/schema.sql`.

---

## Progress log (append one line per commit: `<sha-or-pending> — item # — what changed — DoD status`)

- (start here)
