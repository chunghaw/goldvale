# Building Oscar: when your data is relational, time-series, *and* semantic at once

*A build log for the H0 hackathon (Vercel + AWS Databases). Live demo: https://goldvale.vercel.app · Repo: https://github.com/chunghaw/oscar · #H0Hackathon*

> **[EDIT ME FIRST]** Open with one or two sentences in your own voice about *why you built this* — a specific pet, a specific vet visit, the thing that annoyed you. Judges respond to a real person. Then keep the rest and trim to taste.

I built **Oscar**, a calm daily companion and home-rehabilitation tracker for owners of senior or chronically-ill dogs and cats. The hard part of caring for an aging pet isn't the vet visit — it's the months in between, where you're trying to notice a slow decline and walk into the next appointment with more than "he's been a bit slow lately." Oscar is a 20-second daily check-in that trends a validated mobility score, stores the vet's rehab plan, and — when something feels off — answers *"has this happened before?"*

This post is about the one decision the whole thing hangs on: **the database.**

## The bet: one Aurora instance doing four different jobs

A senior pet's health record isn't one shape. It's:

- **relational** — owner → pet → exercise plan → plan items → protocol → medications;
- **time-series** — a daily check-in, a weekly mobility score, rehab sessions, medication adherence, all stamped and trended;
- **semantic** — "this stiff morning *feels like* one from a few weeks ago," which isn't a keyword match;
- **analytical** — per-pet baselines, minimal-clinically-important-difference (MCID) crossings, rolling adherence.

The lazy version is a relational DB plus a bolted-on vector store plus a sync job. I didn't want a sync job. So everything lives in **one AWS Aurora PostgreSQL (Serverless v2) instance with pgvector** — four load-bearing layers, each doing real work on every request:

| Layer | What's in it |
| --- | --- |
| Relational | `owners`, `pets`, `exercise_plans`, `plan_items`, `protocols`, `red_flag_rules` |
| Time-series | `daily_checkins`, `mobility_score_events`, **range-partitioned** `exercise_session_events`, `medication_events` |
| pgvector | `journal_entries` (text), `media_assets` (image), `literature_chunks` — HNSW cosine |
| Analytics | `rolling_baseline_mv`, `adherence_rollup_mv` (materialized views) |

The payoff: **recall is a query, not an integration.**

## The fun part: two kinds of similarity search on the same rows

The feature I'm proudest of is that Oscar does *two* modalities of vector recall, and both are just SQL against rows that already exist:

- **Text recall.** The owner's journal notes are embedded with **Amazon Titan Text Embeddings v2** (1024-dim) and indexed with pgvector's HNSW. When a "slower rising" pattern surfaces, I embed it and kNN-rank the owner's *own* journal days by meaning. The three stiff mornings come back at ~55/55/41% similarity; the one "good day — trotted to the door" correctly lands last at 5%. That's the whole point of vectors over keywords.

- **Image recall.** Photos go to **S3**, and I embed them with **Titan Multimodal Image v1**. The same `embedding <=> $1` operator now answers *"compare today's incision to last month"* — a 6-photo healing series clusters together (high-0.80s cosine), well above the unrelated walk/rest/garden shots (~0.6–0.76). Same index, same query shape, different modality.

Two kinds of "what does this resemble?" — text and image — and the database doesn't care which. No second datastore, no ETL.

## The non-negotiable: non-clinical *by architecture*

Oscar is health-adjacent, which means it must never pretend to be a vet. I didn't enforce that with prompt-wishing. I enforced it structurally:

- **Every clinical number is computed by deterministic code** (`lib/domain`, pure and unit-tested) — the GenPup-M mobility score, the MCID crossing, the FITT progression nudge. The LLM never produces a score.
- **Bedrock's Claude only narrates** the numbers and poses "questions for your vet."
- **Every model line passes an `assertNonClinical()` guardrail** before it reaches a screen, and red flags route to "contact your vet now."

It's a small idea with a big consequence: the AI can't diagnose because it's never holding the math.

## Two things that bit me (the honest part)

**1. "It connects" is not "it works."** My seed script created journal rows but left the embeddings `null` with a `// backfill once Bedrock keys land` comment — and that backfill never ran after Bedrock came online. Everything compiled, the DB connected, tests passed. But the flagship recall screen quietly showed *"no journal days to compare yet,"* because the kNN query filters on `embedding IS NOT NULL`. I only caught it by **screenshotting the actual screen a judge would see.** Lesson I keep relearning: test the thing the user sees, not the thing that returns a 200. (Fix: the demo seed now embeds its vectors inline, so a reseed can never silently break recall again.)

**2. Bedrock's Anthropic models need an inference-profile id.** Calling the bare `anthropic.claude-...` id returns *"on-demand throughput isn't supported."* You need the regional profile prefix — `us.anthropic.claude-sonnet-4-6`. Twenty minutes of confusion, one prefix.

## Where it's at

It's deployed on Vercel, running on live Aurora + Bedrock, with real validated scales and real open literature — no mock data anywhere a judge looks. It has accounts (so you get your own pet) and a public demo pet (so you don't need one to look around).

If I had to put the database choice in one sentence: **a senior pet's record is relational, time-series, and semantic at the same time, so it belongs in one engine that can be all three — and Aurora + pgvector let "this resembles five weeks ago" be a `JOIN`, not a project.**

*Built with Next.js 16 on Vercel, AWS Aurora PostgreSQL Serverless v2 + pgvector, Amazon Bedrock (Claude Sonnet 4.6 + Titan text & multimodal embeddings), and S3. #H0Hackathon*
