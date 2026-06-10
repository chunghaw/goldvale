# AGENT_HANDOFF.md — context transfer

> **New agent / fresh session: read this + `CLAUDE.md` first, then `docs/BUILD_PLAN.md` and `HANDOFF.md`.**
> This is the living "memory" of the project — what it is, the decisions and *why*, what's built, what's blocked, and the exact next move. Update it as state changes.

---

## 1. Your role (the prompt)

You are the **orchestrator + builder** for **Goldvale**. You decompose work, implement it (Next.js / TypeScript / Drizzle / Bedrock), and keep `main` demo-ready. A reviewer ("Codex") and an evaluation gate sit in the loop:

**Build → Codex review → evaluation gate → fix → next.** Run features through the `feature-loop` workflow (`.claude/workflows/feature-loop.js`). A feature only ships when it passes the 6-point **Definition of Done** (see `docs/BUILD_PLAN.md`): works on real data · data-model integrity · **non-clinical guardrails** · AWS features exercised · `tsc`+`vitest` green · demo-ready.

**The cardinal rule — NON-CLINICAL:** Goldvale tracks, remembers, and prepares; it never diagnoses, grades, stages, or prescribes. Clinical scores are computed by **deterministic code in `lib/domain`, never the LLM**. Every model output passes `assertNonClinical()` (use `narrateSafe()`). Red flags route to "contact your vet now."

---

## 2. What Goldvale is

A calm daily companion + **home-rehabilitation tracker** for owners of **senior or chronically-ill dogs/cats**. A 20-second daily check-in (QoL + mobility) trends a **validated mobility score**, logs the vet-prescribed rehab plan, uses **pgvector** to surface "this flare resembles 5 weeks ago" pattern memory, and packages a cited, **vet-ready brief**. It supports the vet's plan — the vet decides.

Six features (full detail in `docs/proposals/H0_GOLDVALE_BRIEF.html`): ① mobility sub-score on the daily check-in (the wedge) · ② vet-plan-gated exercise track + FITT progression *nudge* · ③ pose form-coaching (non-clinical) · ④ condition templates (TPLO/IVDD) + red-flag escalation · ⑤ environmental-modification audit (ungated on-ramp) · ⑥ rehab-aware vet-prep brief + referral.

---

## 3. The hackathon

**H0: "Hack the Zero Stack with Vercel v0 + AWS Databases"** (hosted by AWS). **Track: Monetizable B2C.** Deadline **2026-06-29 17:00 PDT**. Required: a **published Vercel** project link + **an AWS database (Aurora PostgreSQL) as the primary backend**, public repo + MIT license, <3-min video, architecture diagram, screenshots proving Aurora use, Vercel Team ID. Judging (equal weight): Technical Implementation (the **DB modeling** is the centerpiece — judges are AWS database specialists), Design, Impact/real-world, Originality. +0.6 bonus for #H0Hackathon build-log posts.

---

## 4. Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 16 (App Router) + React 19 + TS + Tailwind v4 → **claude.ai/design** screens (NOT v0) |
| Hosting | **Vercel** (it's a responsive **web app**, mobile-first + an installable PWA shell in It.5 — not native) |
| Database | **AWS Aurora PostgreSQL + pgvector** — relational + time-series + vector + analytics (the one backend) |
| ORM | Drizzle (`db/schema.sql` is canonical DDL; `lib/db/schema.ts` is the typed query layer) |
| AI | Vercel AI SDK + **Amazon Bedrock (Claude)**; Titan/Cohere embeddings (1024-dim) |
| Auth/pay | Auth.js + Stripe (Iteration 4) |

---

## 5. Decision log (the "why")

- **Pivoted off the original product (Prism)** when the prior hackathon's $100 GCP credits dried up → switched to H0 (AWS+Vercel), which fits the user's stack (Vercel Pro, SQL/dbt). The old `prism` repo is **dead/disposable** (see §9).
- **Chose a new product, not Prism**, and after research picked **Goldvale** (senior-pet care) over other pet/stock/mental-health ideas. Then a **monetization pass reframed the field**: lost-pet ("Reunipet") scored highest on craft but **2/5 on revenue realism** (search is a free/nonprofit commodity); dog-training ("Tideline") had the best proven money but is crowded; **Goldvale won on balance** — original niche + sticky daily loop + rich data model.
- **Added animal physiotherapy** — mobility decline is the #1 senior/chronic burden and home-manageable, so it threads through every surface (not bolted on).
- **AWS DB = Aurora PostgreSQL + pgvector** (over DSQL/DynamoDB): relational + time-series + vector + analytics in one engine = the richest "deliberate data modeling" story for these judges, and fits the user's SQL strength.
- **AI = Bedrock Claude via Vercel AI SDK** (hits both sponsors).
- **Validated scales licensing (critical):** only embed **GenPup-M** (CC-BY, 24-item mobility) + **HCPI** (free). **LOAD / CBPI / FMPI / COAST are license-gated → vet-administered** (store the vet's result, never reproduce the form).
- **Pose/CV = form-coaching only**, never gait analysis — no validated home dog-gait system exists (2026 review); framing it clinically would be wrong + a liability.
- **Mobile-first responsive *web* app + installable PWA shell (It.5); real web-push deferred** (post-hackathon stretch — high effort, iOS-flaky, not judge-scored).
- **New separate GitHub repo** (`chunghaw/goldvale`), not a restructure of prism.

---

## 6. Current build state (✅ done + tested)

Repo: **github.com/chunghaw/goldvale**, local `C:\Users\EdmundTan\projects\goldvale`, branch `main`. `tsc --noEmit` clean, **25 vitest tests pass**, `npm run lint` + `next build` green (all 3 routes compile). `handoff/` + `design/` are eslint-ignored (raw design mocks).

| Area | Files |
| --- | --- |
| Aurora DDL (4 layers) | `db/schema.sql` — relational + partitioned time-series + pgvector HNSW + materialized views |
| **Non-clinical core** (pure, tested) | `lib/domain/mobility.ts` (GenPup-M scoring + MCID), `guardrails.ts` (`assertNonClinical`), `progression.ts` (FITT nudge) + `.test.ts` each |
| Data layer | `lib/db/schema.ts` (typed Drizzle), `lib/db/client.ts` (lazy Aurora singleton) |
| AI | `lib/ai/bedrock.ts` (chat + embeddings; `narrateSafe` enforces the guardrail) |
| Seed + scripts | `lib/db/seed-data.ts`, `scripts/migrate.ts` (applies schema.sql), `scripts/seed.ts` |
| Agentic factory | `.claude/agents/{builder,reviewer-codex,db-specialist}.md`, `.claude/workflows/feature-loop.js`, `scripts/codex-review.ps1`, `.claude/settings.json`, `.mcp.json` (Postgres MCP) |
| Brand | `app/globals.css` — shipped the **cooled** token variant the mocks were tuned for (bg #eef1ef, charcoal #20262a, sage #4f8a7d, gold #d6981e) + section-accent family + Newsreader serif + `gv-*` interaction classes |
| **UI — 3 demo screens wired** | `components/ui/*` (Card, SectionHead, Face, Hero, VetLine, icons, tokens) + `components/{checkin,dashboard,vet-brief}/*Screen.tsx`. Routes: `/pets/[id]` (dashboard), `/pets/[id]/checkin`, `/pets/[id]/brief`; `/` redirects to the demo pet. Ported from `handoff/` exports, typed from DB/domain shapes, guardrail-enforced. |
| **Data seam — LIVE on Aurora** | `getPetView(id)` (`lib/data/pets.ts`) reads **live from Aurora** when `DATABASE_URL` is set (`lib/data/queries.ts`), else the domain-computed demo fallback (`demo.ts`). Same `PetView` shape (`view.ts`) either way. `queries.ts` exercises all 4 layers per read (relational pet/plan/protocol · time-series check-ins/scores/partitioned sessions/meds · the 2 materialized views · pgvector-ready). Every clinical figure from `lib/domain`; every narrative passes `assertNonClinical`. |
| **AWS go-live (done)** | Aurora PG 17.7 Serverless v2 (us-east-1, public, password auth) live. **Bedrock live**: Titan embeddings (1024-dim) + **Claude `us.anthropic.claude-sonnet-4-6`** (all Anthropic models need a `us.`/`global.` inference-profile id — bare id = "on-demand not supported"). `.env` has working `DATABASE_URL` + AWS keys. `scripts/`: `migrate` · `seed` · **`seed-demo-pet`** (Oscar's 34-day history) · **`backfill-embeddings`** (Titan → pgvector) · `smoke` (4-layer) · `bedrock-models` (list invokable ids) · `bedrock-smoke` · `check-view` · `check-recall`. Demo pet = **Oscar** (`OSCAR_PET_ID`, `lib/data/ids.ts`). |
| **pgvector recall (live in UI)** | `recallSimilarJournal()` (`lib/data/queries.ts`) embeds a query + kNN over `journal_entries` (HNSW cosine). Surfaced at `/pets/[id]/recall` (`components/recall/RecallScreen.tsx`), deep-linked from the dashboard + check-in. Verified live on Vercel. |
| **Check-in write (live)** | `persistCheckin` (`lib/data/checkin-write.ts`) + `saveCheckin` server action (`lib/actions/checkin.ts`) insert across the time-series + pgvector layers (note embedded via Titan). |
| **🚀 DEPLOYED to Vercel** | **https://goldvale.vercel.app** (project `chung-haws-projects/goldvale`, GitHub-connected → auto-deploys on push to `main`). All 8 env vars set on Production; Aurora SG opened to `0.0.0.0/0:5432` for Vercel egress (`scripts/sg-demo.ts open`/`close` — **re-lock after the hackathon**). All routes 200 with live Aurora+Bedrock data. |
| Docs | `CLAUDE.md`, `docs/BUILD_PLAN.md`, `HANDOFF.md` (frontend), `docs/proposals/*.html` |

---

## 7. What's pending / blocked

**Go-live is DONE — Aurora + Bedrock + both AI features are live and verified.** No remaining infra blockers. The full vertical slice works on real data: the 3 screens read live, the check-in **writes** live, and pgvector recall is exposed in the UI.

1. **Check-in save — DONE.** `lib/data/checkin-write.ts` (`persistCheckin`, pure/testable) + `lib/actions/checkin.ts` (`"use server"` wrapper, revalidates `/pets/[id]`). CheckinScreen calls it; inserts `daily_checkins` + partitioned `exercise_session_events` + `medication_events` + `journal_entries` (note embedded via Titan). Verified live by `scripts/check-save.ts` (round-trips +1 each table, then cleans up).
2. **Recall UI — DONE.** `/pets/[id]/recall` (`app/pets/[id]/recall/page.tsx` + `components/recall/RecallScreen.tsx`) runs live `recallSimilarJournal` and ranks the owner's own journal days by meaning; deep-linked from the dashboard PatternCard + the check-in confirmation. Degrades gracefully if Bedrock/DB is unreachable.
3. **Next up (no blockers):** deploy to Vercel (wire the `.env` vars as Vercel env), then onboarding + exercise-track screens, and Iterations 2–5 (`docs/BUILD_PLAN.md`). Token choice = cooled (made).

---

## 8. User profile (Edmund)

Pragmatic data engineer (SQL / dbt / Microsoft Fabric / ACHA migration). Values: **working software, local-first, honest reporting (no fabricated success), and NO mock data in the demo path.** Designs the frontend himself in claude.ai/design and hands code over. GitHub handle `chunghaw`; email `etan@imsystems.com.au`.

---

## 9. Environment + folders (gotchas)

- **`goldvale` is the canonical project.** The sibling `C:\Users\EdmundTan\projects\prism` is the old/dead repo (different GitHub remote) — disposable; its useful HTMLs were copied into `docs/proposals/`. Don't merge them (two separate `.git`s). Open VS Code on the **goldvale** folder for future sessions.
- **Windows + PowerShell.** The terminal tool is PowerShell (a `Bash` tool may or may not be present in a given session — don't rely on it). `git push` prints stderr that PowerShell renders as a red "error" — it usually **succeeded** (look for the `<sha>..<sha> main -> main` line).
- **Git auth** is cached (Git Credential Manager) for `chunghaw` — pushes are seamless.
- **Aurora SG / IP whitelist gotcha.** Aurora is public but its security group (`goldvale-db-sg`, `sg-04ed2dff46b24c2c3`) only allows whitelisted IPs on 5432. **When the dev machine's public IP changes, connections hang with `ETIMEDOUT`.** Fix: get the current IP (`(Invoke-RestMethod https://api.ipify.org?format=json).ip`), add an inbound rule **PostgreSQL/TCP/5432/`<ip>`/32** to that SG (EC2 → Security Groups; use the exact IP, NOT the console's "My IP"). Probe with `Test-NetConnection <writer-endpoint> -Port 5432` (`TcpTestSucceeded`). If even the right IP fails, the local network may block outbound 5432 → use a different network or `0.0.0.0/0` temporarily.
- **Bedrock model ids need an inference profile.** Bare `anthropic.*` ids return "on-demand not supported"; use the `us.`/`global.` prefix (current: `us.anthropic.claude-sonnet-4-6`). `scripts/bedrock-models.ts` lists what's invokable.
- **Vercel deploy (CLI).** `vercel deploy --prod --yes`. GitHub is connected so pushes to `main` also auto-deploy. Env vars are **Sensitive** so `vercel env pull` shows them blank — that's normal, NOT empty; verify via the app, not the pull.
- **⚠️ Setting Vercel env vars from PowerShell adds a UTF-8 BOM.** Piping a value (`$v | vercel env add` *or* `... | node vc.js env add`) prepends a `﻿` BOM → `DATABASE_URL` becomes 121 chars and throws `Invalid URL`; every value is corrupted. **Fix that works:** write the value to a BOM-free temp file (`[IO.File]::WriteAllText($f,$v,(New-Object System.Text.UTF8Encoding $false))`) and feed it via `Start-Process node -ArgumentList @($vc,'env','add',$k,'production') -RedirectStandardInput $f -Wait`. A temporary `app/api/debug` route (env lengths/heads + a `select 1`) is the fastest way to diagnose this class of issue — delete it after.
- **Secrets** live only in `.env` (gitignored via `.env*` + `!.env.example`). Never commit keys.
- **Custom `.claude/agents` register on a fresh session**, not mid-session — a mid-session workflow must use the default agent with roles inlined.

---

## 10. Immediate next action

The 3 demo screens are built and showable on demo data. The critical-path move now is **make them real** — which needs AWS:
- **AWS values →** create `.env`, `npx tsx scripts/migrate.ts` + `scripts/seed.ts`, then replace the `getPetView` body in `lib/data/pets.ts` with real Aurora queries (relational pet/plan + time-series check-ins/scores + pgvector recall + the adherence/baseline MVs) — the `PetView` shape and every component stay unchanged. Then wire the check-in **save** server action and the pgvector pattern-memory recall (live Bedrock embeddings via `narrateSafe`).
- **More design screens (onboarding, exercise-track) →** same pattern: presentational component in `components/` + typed view-model in `lib/data` + a route.

Design and AWS proceed in parallel.
