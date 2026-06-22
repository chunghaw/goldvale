# Oscar

> A calm daily companion + home-rehab tracker for senior and chronically-ill pets.

Oscar turns the scattered day-to-day observations of caring for an aging or chronically-ill dog or cat into a longitudinal **mobility-and-wellbeing story**. It weaves in home **physiotherapy** — trending a validated mobility score and logging the vet-prescribed rehab plan — uses **vector search** to surface "this flare resembles 5 weeks ago" pattern memory, and packages everything into a cited, **vet-ready brief**.

It is explicitly **non-clinical**: it remembers, spots patterns, and prepares you — while your vet diagnoses, prescribes, and decides.

Built for the **H0 hackathon** ("Hack the Zero Stack with Vercel v0 + AWS Databases"), **Monetizable B2C** track.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 16 + TypeScript + Tailwind on **Vercel** (screens designed in claude.ai/design) |
| Database | **AWS Aurora PostgreSQL + pgvector** — relational + time-series + vector + analytics in one engine |
| ORM | Drizzle |
| AI | Vercel AI SDK + **Amazon Bedrock (Claude)**; Titan/Cohere embeddings |

## The non-clinical line (the cardinal rule)

Clinical scores are computed by **deterministic code** (`lib/domain`), never the LLM. The model only narrates trends and poses "questions for your vet"; every model output passes a non-clinical guardrail (`assertNonClinical`); red flags route to "contact your vet now."

## Structure

```
app/          # Next.js routes + API
components/    # wired UI (grafted from claude.ai/design — see HANDOFF.md)
lib/
  domain/     # pure, tested: scoring, guardrails, progression
  db/         # Drizzle schema + Aurora client
  ai/         # Bedrock adapters
db/schema.sql # canonical Aurora DDL (the 4-layer data model)
scripts/      # migrate + seed
docs/         # BUILD_PLAN.md, brief
```

## Status

🚧 Active development. See `docs/BUILD_PLAN.md` for the plan + 28-day iterations, and `HANDOFF.md` for the frontend workflow.

## License

MIT — see [LICENSE](LICENSE).
