# OVERNIGHT_PROMPTS.md

Prompts for the unattended overnight improvement session. The task list itself is in
`docs/OVERNIGHT_GOALS.md`. Launch Claude Code with `--dangerously-skip-permissions`,
then tell it: **"Read docs/OVERNIGHT_PROMPTS.md and execute the MASTER PROMPT exactly. Begin now."**

---

## MASTER PROMPT

ROLE & MISSION
You are the orchestrator + builder for Oscar, running an UNATTENDED overnight
session. No human will approve steps tonight. Proceed fully autonomously: never
pause to ask a question, never wait for confirmation. If something genuinely
blocks you, log it and move to the next item. Your mission is to resolve the
issues in docs/OVERNIGHT_GOALS.md with real, tested, reviewed fixes.

CONTEXT TO LOAD FIRST (in this order, fully)
1. AGENT_HANDOFF.md   — project state, decision history, environment gotchas.
2. CLAUDE.md          — critical rules. The CARDINAL RULE is NON-CLINICAL.
3. docs/OVERNIGHT_GOALS.md — your task list, with per-item detail + DoD.
4. docs/BUILD_PLAN.md — the 6-point Definition of Done.
Skim lib/domain/guardrails.ts, lib/data/queries.ts, lib/ai/companion.ts so you
understand the seams before editing.

ENVIRONMENT (Windows / PowerShell)
- Primary shell is PowerShell; a Bash tool may also exist. Use POSIX syntax only
  in the Bash tool, PowerShell syntax everywhere else.
- Tests and type/lint/build checks run fully OFFLINE — do not require Aurora or
  Bedrock for any test you write. Pure logic lives in lib/domain and the shaping
  helpers in lib/data; test those without network.
- DO NOT attempt to connect to Aurora/Bedrock unless an item truly requires it.
  If you do and it hangs with ETIMEDOUT, that is the IP-whitelist/security-group
  gotcha documented in AGENT_HANDOFF.md section 9 — do NOT try to fix infra; mark
  the item blocked and move on.

GIT DISCIPLINE
- Start: `git switch -c overnight/goals` (branch off current main). The
  docs/OVERNIGHT_*.md files will be untracked — that is expected (they are your
  task list); commit them as your first commit on the branch. Otherwise the tree
  should be clean.
- DO NOT push. DO NOT deploy. DO NOT touch main. Edmund reviews + merges in the
  morning. Pushing main auto-deploys to the live demo — forbidden tonight.
- One item = one focused commit. Never bundle two goals into one commit.
- Commit message: a clear subject, a short body if needed, ending with exactly:
      Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
- Never use --no-verify. If a hook fails, fix the root cause.

THE PER-ITEM LOOP (repeat for every item, P1 -> P2 -> P3 -> P4 -> cleanups, IN ORDER)
For the current item:
  1. PLAN: restate the item in one sentence and name the files you'll change.
  2. IMPLEMENT: smallest correct change. Keep "pure core, thin edges" —
     deterministic clinical logic stays in lib/domain; adapters wrap it.
  3. TEST: add or extend a test that FAILS before your fix and PASSES after.
     Behavioural fixes (P1/P2/P3) MUST get a test. UI items (P4) get a test where
     feasible; otherwise note in the log how you verified.
  4. VALIDATE — run all four, require all green:
        npx tsc --noEmit
        npx vitest run
        npm run lint
        npx next build
     If any is red, fix and re-run from step 4. Do not proceed while red.
  5. GUARDRAIL CHECK: if the change touches user-facing copy or an LLM output
     path, confirm every string passes assertNonClinical / narrateSafe. Any
     fallback/error copy you add must be non-clinical and route to the vet. Never
     weaken, stub, or bypass the guardrail to make something pass.
  6. REVIEW: run the reviewer-codex agent on the diff. Treat "blocking" findings
     as must-fix -> return to step 2. "Nits" are optional.
  7. COMMIT: once 4, 5, and 6 are satisfied, commit this single item.
  8. LOG: append one line to the Progress log at the bottom of
     docs/OVERNIGHT_GOALS.md:
        <short-sha> — item #N — <what changed> — DoD: tsc/vitest/lint/build green, codex OK

BLOCKED-ITEM POLICY
If an item cannot be completed (needs a live connection you can't reach, or a real
product decision): append to the Progress log:
   BLOCKED — item #N — <one-line reason> — <what a human must decide/provide>
then immediately move to the next item. Never stall; never burn the night retrying
the same failing thing.

HARD CONSTRAINTS (do not violate)
- No mock/fake data anywhere a judge could see. Real validated scales + real data
  only. Reseeding the demo pet is NOT your job tonight — don't run seed scripts.
- No new pet-scoped server action without requirePetAccess(petId).
- No secrets committed; .env stays gitignored.
- Don't edit the frozen demo date for the DEMO pet — P1 #1 only adds a LIVE clock
  for NON-demo pets; the demo pet stays anchored to 2026-06-09.
- Every commit leaves the branch demo-ready (all four checks green).

FINISH
When all items are done or blocked, append a SUMMARY to docs/OVERNIGHT_GOALS.md:
  - Shipped: item # + one-line outcome + commit sha, for each completed item.
  - Blocked: item # + reason + what's needed to unblock.
  - Test delta: tests before vs after (run `npx vitest run` and report).
  - Follow-ups: anything noticed but intentionally left out of scope.
Commit that summary, print `git log --oneline main..overnight/goals`, then STOP.
Do not push.

BEGIN NOW: load context, create the branch, commit the task docs, confirm clean
tree, then start P1 #1.

---

## PER-ITEM PROMPTS (optional — to run a single item, e.g. via the feature-loop)

Each assumes the same loop: implement -> test -> tsc/vitest/lint/next build green ->
reviewer-codex -> commit on branch overnight/goals, no push.

### P1 #1 — Live clock for real pets
lib/data/queries.ts:54 and lib/data/media.ts:11 hardcode
NOW = new Date("2026-06-09T09:00:00Z"). Correct for the seeded demo pet
(OSCAR_PET_ID in lib/data/ids.ts) but wrong for any pet a user creates. Thread a
`now: Date` parameter through getPetView and the query/media functions instead of
the module constant. Demo pet -> frozen 2026-06-09; every other pet -> new Date().
Leave seed scripts frozen. Add a unit test proving demo->frozen and non-demo->live
(inject the clock; no network).

### P1 #2 — Refresh materialized views after a check-in
adherence_rollup_mv and rolling_baseline_mv (db/schema.sql) are refreshed by
scripts/seed-demo-pet.ts but not by lib/data/checkin-write.ts (persistCheckin).
After a successful check-in write, REFRESH MATERIALIZED VIEW CONCURRENTLY both
(CONCURRENTLY needs a unique index — verify/add in db/schema.sql). Make the refresh
non-fatal (a refresh failure must not lose the check-in). Add a no-network test on
the write path shape.

### P1 #3 — Error boundary around the companion agent
lib/actions/companion.ts and the tool executors in lib/ai/companion.ts
(logToJournal, recallPastNotes, addVetBriefQuestion, escalateToVet) don't wrap
runCompanion/embedText/DB inserts. (a) wrap each tool execute in try/catch to
return a graceful result instead of throwing; (b) wrap the action so a failure
persists a safe fallback assistant message and returns cleanly. All fallback copy
MUST pass assertNonClinical and route to the vet. Test that a thrown error yields
the safe fallback (mock the agent; no network).

### P2 #4 — Scope getSimilarMedia to the pet
lib/data/media.ts:78 looks up the reference embedding without constraining to the
pet. Add `and pet_id = ${petId}` to that subquery. Add/extend a query-shape test.

### P2 #5 — FK constraints on partitioned event tables
exercise_session_events (and the medication/check-in event tables in db/schema.sql)
carry pet_id/exercise_id with no REFERENCES. Add FKs (cascade for pet_id, restrict
for exercise_id). Add a migration script under scripts/ following migrate-*.ts.
Update db/schema.sql and lib/db/schema.ts. Do NOT run the migration against live
Aurora.

### P2 #6 — Bound text input lengths
Companion tool Zod schemas (lib/ai/companion.ts) and check-in notes
(lib/data/checkin-write.ts) accept z.string() with no max. Add .max() caps
(notes ~2000, recall query ~500) and reject/trim overlong input at the action
boundary with a friendly, non-clinical message. Test the boundary.

### P3 #7 — Harden the non-clinical guardrail
lib/domain/guardrails.ts misses evasions: "consistent with", "resembles", "typical
of", "suspect", past-tense "had arthritis", "undiagnosed". Extend BANNED_PATTERNS
without false-positiving safe vet-routing copy. Build an adversarial corpus in
guardrails.test.ts: phrasings that MUST block + safe phrasings that MUST pass
(include the app's real fallback strings). Over-test it.

### P3 #8 — Access-control + empty-pet tests
Add two no-network tests: (1) ownership — ownerOwnsPet/requirePetAccess denies a
logged-in owner access to another owner's pet, allows the demo pet; (2) empty pet —
a pet with zero check-ins/exercises yields a clean PetView (band "none", empty
series, no NaN). Refactor lightly for testability if needed.

### P4 #9 — Global :focus-visible
QoL faces, mobility options, rep counters, icon-only buttons have no visible focus
ring. Add a global :focus-visible rule in app/globals.css using --sage (outline +
offset); reads well on light cards and the hero gradient. Verify nothing overrides
it.

### P4 #10 — Loading / error recovery states
DashboardScreen has no skeleton; CompanionScreen error has no retry;
MediaTimelineScreen visual recall fails silently; VetBriefScreen "Share" only
toggles a flag. Add dashboard skeletons, a Retry on the companion error, a spinner
+ error on visual recall, honest Share feedback, and role="alert"/aria-live on
toasts + the typing indicator. Keep the calm style.

### P4 #11/#12/#13 — a11y semantics, mobile overflow, contrast (one commit each)
(11) Field-associated validation (role="alert") in CheckinScreen + OnboardingScreen;
QoL faces as a role="radio" group; dashboard timeline as <ol> with
aria-current="step".
(12) Mobile overflow: remove Hero whiteSpace:nowrap; media grid
repeat(auto-fit, minmax(140px,1fr)); wrap tolerance pills; clamp() chat bubble
width — no desktop regression.
(13) Contrast: darken the muted token (e.g. #5a6359) in app/globals.css to pass
WCAG AA; keep screens calm.
