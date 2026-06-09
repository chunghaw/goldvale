/**
 * Backfill Bedrock Titan embeddings into the pgvector columns so semantic recall
 * (the "this flare resembles 5 weeks ago" kNN) runs on real vectors.
 *
 *   npx tsx --env-file=.env scripts/backfill-embeddings.ts
 *
 * Embeds journal_entries.text and a synthesized narrative per mobility_score_event.
 * Idempotent: only fills rows whose embedding is still null.
 */
import { eq, isNull, sql } from "drizzle-orm";
import { getDb } from "../lib/db/client";
import { journalEntries, mobilityScoreEvents } from "../lib/db/schema";
import { embedTexts } from "../lib/ai/bedrock";
import { bandFor } from "../lib/domain/mobility";

async function main() {
  const db = getDb();

  // ── journal entries ─────────────────────────────────────────────────────────
  const journals = await db.select().from(journalEntries).where(isNull(journalEntries.embedding));
  if (journals.length) {
    const vecs = await embedTexts(journals.map((j) => j.text));
    for (let i = 0; i < journals.length; i++) {
      await db.update(journalEntries).set({ embedding: vecs[i] }).where(eq(journalEntries.id, journals[i].id));
    }
  }
  console.log(`✓ journal_entries embedded: ${journals.length}`);

  // ── mobility score events (synthesize a short period text to embed) ─────────
  const scores = await db.select().from(mobilityScoreEvents).where(isNull(mobilityScoreEvents.embedding));
  if (scores.length) {
    const texts = scores.map((s) => {
      const total = Number(s.totalScore);
      return `GenPup-M mobility total ${total} of 108, ${bandFor(total)} band, recorded ${s.recordedAt.toISOString().slice(0, 10)}.`;
    });
    const vecs = await embedTexts(texts);
    for (let i = 0; i < scores.length; i++) {
      await db.update(mobilityScoreEvents).set({ embedding: vecs[i] }).where(eq(mobilityScoreEvents.id, scores[i].id));
    }
  }
  console.log(`✓ mobility_score_events embedded: ${scores.length}`);

  const [{ jn }] = await db.execute<{ jn: number }>(
    sql`select count(*)::int as jn from journal_entries where embedding is not null`,
  );
  console.log(`Total journal vectors present: ${jn}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
