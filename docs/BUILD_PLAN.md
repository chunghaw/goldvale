# Goldvale — Build Plan

H0 hackathon ("Hack the Zero Stack with Vercel v0 + AWS Databases"), **Monetizable B2C**. Deadline **2026-06-29 17:00 PDT**.

## The loop (orchestration + evaluation)

**Orchestrator** (Claude) decomposes each iteration → **Builder** implements (Next.js / Drizzle / Bedrock + Vitest) → **Codex** reviews the diff → **Evaluation gate** → fix → next. Run via the `feature-loop` workflow. An iteration only ships when it passes the **Definition of Done**:

1. **Works end-to-end on real data** (no mock in the demo path)
2. **Data-model integrity** — migrations apply; partitions + materialized views compute; pgvector dims consistent
3. **Non-clinical guardrails** — scores deterministic (`lib/domain`, never the LLM); every model output through `assertNonClinical()`; red flags route to the vet
4. **AWS features exercised** — Aurora relational + time-series + pgvector + analytics; Bedrock used
5. **Green** — `npx tsc --noEmit` + `npm run test`
6. **Demo-ready** — the Bramble flow passes a Playwright smoke test on the Vercel preview URL

## 28-day iterations

| It. | Days | Build | Eval gate |
| --- | --- | --- | --- |
| **0 — Spine** | 1–3 | AWS (Aurora+Bedrock) + Vercel + repo + CI; apply `db/schema.sql`; wire Drizzle + AI SDK | One real daily check-in round-trips Aurora→UI; Bedrock returns a completion; migrations green |
| **1 — The wedge** | 4–8 | Mobility sub-score on the daily check-in + GenPup-M scoring + trend + **pgvector "resembles a past flare"** recall | Core demo moment on real data; deterministic scoring + MCID flag; guardrail tests pass |
| **2 — Adherence** | 9–13 | Vet-plan-gated exercise track + FITT progression *nudge*; environmental audit (ungated on-ramp) | Adherence rollup correct; nudge fires only on rule; exercise content gated behind a plan |
| **3 — The brief** | 14–18 | Vet-prep brief = time-series rollups + pgvector analogues + **cited literature RAG** (OpenAlex/PubMed) + referral directory | Brief grounded/cited, non-diagnostic, exports/shares; co-caregiver view |
| **4 — Depth + money** | 19–23 | Condition templates + red-flag escalation; pose form-coaching (CV, non-clinical); Auth + Stripe freemium | Red flags route to vet; pose framed as coaching only; paywall + trial work |
| **5 — Ship** | 24–28 | claude.ai/design polish; **installable PWA shell** (manifest + gold app icon + theme-color + `display: standalone`); deploy; architecture diagram; screenshots; **<3-min video**; #H0Hackathon posts; Devpost submit | Full demo on the hosted URL on real data; installs to home screen; submission checklist complete |

### Post-hackathon stretch (captured, not in the 28-day timeline)

- **Web-push reminders** ("did you do today's check-in?") — needs a service worker + VAPID + a push backend, and on iOS Safari only works after the PWA is installed (16.4+). High effort, cross-browser flaky, and not what these DB judges score — defer. (A simple in-app/email nudge is the cheap stand-in if a reminder beat is wanted for the demo.)
- Native wrapper (Capacitor) only if an App Store presence is ever needed — the PWA covers "feels like an app" without it.

## Status (foundation, credential-independent)

- ✅ Next.js 16 + TS + Tailwind scaffold
- ✅ `db/schema.sql` — Aurora 4-layer model (relational + partitioned time-series + pgvector HNSW + materialized views)
- ✅ `lib/domain` — deterministic non-clinical core (mobility scoring, guardrails, FITT nudge), **13 tests**
- ✅ `lib/db` (Drizzle schema + lazy Aurora client), `lib/ai` (Bedrock chat/embeddings + `narrateSafe`)
- ✅ Seed data (scale registry, exercise library, mods, TPLO/IVDD protocols, red flags) + migrate/seed scripts
- ✅ Agentic factory: sub-agents, `feature-loop` workflow, Codex bridge, Postgres MCP
- ✅ Public GitHub repo pushed (chunghaw/goldvale, MIT) + brand tokens wired into the Tailwind theme
- ⏳ **Blocked on:** AWS IAM creds + Bedrock model access (→ provision Aurora, apply schema + seed, go live → Iteration 0/1); first claude.ai/design screen (→ wire it)

## What we need

1. ✅ Public GitHub repo (MIT) — done: chunghaw/goldvale.
2. **AWS IAM creds + region**, Bedrock model access enabled (Claude + Titan embeddings) → provision Aurora Serverless v2, `npx tsx scripts/migrate.ts`, `npx tsx scripts/seed.ts`.
3. AWS/Vercel credits form + Devpost registration. Vercel token (for deploy) when we reach It. 5.
