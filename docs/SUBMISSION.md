# Goldvale — H0 hackathon submission assets

**Live demo:** https://goldvale.vercel.app — opens on Oscar's dashboard; the daily
check-in, vet brief, and pattern-memory recall link from there.

**Repo:** https://github.com/chunghaw/goldvale (public, MIT) · **Vercel team:** `team_1NrzZKgn3I3Rh1M8ZHukgoOw`

> Goldvale tracks, remembers, and prepares — it **never diagnoses**. Clinical scores
> are computed by deterministic code (`lib/domain`), never the LLM; every model line
> passes `assertNonClinical()`.

## Architecture

![Architecture](architecture.svg)

One **AWS Aurora PostgreSQL (Serverless v2)** backend, four load-bearing layers, with
**Amazon Bedrock** (Claude Sonnet 4.6 narration + Titan v2 embeddings) via the Vercel AI
SDK, all hosted on **Vercel** (Next.js 16).

## AWS-database proof — all four layers exercised per request

| Layer | In the schema | Proven by |
| --- | --- | --- |
| **Relational** | owners · pets · exercise_plans · plan_items · protocols · red_flag_rules · scale_instruments | `scripts/smoke.ts`, dashboard plan/protocol |
| **Time-series** | daily_checkins · mobility_score_events · **partitioned** exercise_session_events · medication_events | mobility trend, adherence, check-in writes |
| **pgvector** | journal_entries · literature_chunks (HNSW cosine) | the recall screen below (live kNN) |
| **Analytics** | `rolling_baseline_mv` · `adherence_rollup_mv` (materialized views) | baselines + weekly adherence |

## Screenshots (live, on real Aurora + Bedrock)

| Onboarding | Daily check-in | Dashboard |
| --- | --- | --- |
| ![onboarding](screenshots/onboarding.png) | ![checkin](screenshots/checkin.png) | ![dashboard](screenshots/dashboard.png) |

| Vet brief | Pattern-memory recall | Exercise track |
| --- | --- | --- |
| ![brief](screenshots/brief.png) | ![recall](screenshots/recall.png) | ![exercises](screenshots/exercises.png) |

| AI companion (chat agent) | Media library + visual recall | |
| --- | --- | --- |
| ![companion](screenshots/companion.png) | ![media](screenshots/media.png) | |

The **companion** is a non-clinical chat **agent**: Bedrock Claude (Sonnet 4.6) with
tool-use over Aurora — it logs the owner's notes, recalls their own history (pgvector),
narrates the mobility trend, flags items for the vet, and escalates red flags — with the
guardrail on every reply. The rich cards in the thread are real tool outputs.

The **media library** stores photos/clips in **S3** and embeds photos with **Titan
multimodal**; "Similar days" is a **pgvector kNN** over those image vectors — the 6-photo
incision series clusters at 95–97% so the owner sees the same spot over six weeks.
Two more layers exercised: object storage + multimodal vectors.

The **recall** screen is the pgvector payoff: it embeds the surfaced pattern with Titan
and kNN-ranks Oscar's own journal days by meaning — Jun 4 (66%), May 30 (55%),
May 22 (41%), and the "good day" correctly last at 5%. The **exercise track** is
vet-plan-gated: it logs adherence and surfaces the FITT progression nudge only when
`lib/domain` says it's earned — always a question, never an auto-advance.

## Submission checklist
- [x] Published Vercel project link
- [x] AWS database (Aurora PostgreSQL) as the primary backend — 4 layers
- [x] Public repo + MIT license
- [x] Architecture diagram (`docs/architecture.svg` / `.png`)
- [x] Screenshots proving Aurora use (`docs/screenshots/`)
- [x] Vercel Team ID
- [ ] <3-minute demo video
