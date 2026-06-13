/**
 * Seed a short starter conversation in Oscar's companion thread so the screen shows
 * the rich cards (logged / recall / mobility) on load. Grounded in real data — the
 * recall dates and the mobility series match Oscar's seeded history. Re-runnable.
 *   npx tsx --env-file=.env scripts/seed-companion-demo.ts
 */
import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/client";
import { chatThreads, chatMessages } from "../lib/db/schema";
import { OSCAR_PET_ID } from "../lib/data/ids";

async function main() {
  const db = getDb();
  await db.delete(chatThreads).where(eq(chatThreads.petId, OSCAR_PET_ID)); // cascades messages
  const [thread] = await db.insert(chatThreads).values({ petId: OSCAR_PET_ID }).returning({ id: chatThreads.id });

  await db.insert(chatMessages).values([
    {
      threadId: thread.id, role: "owner",
      text: "Oscar seemed a bit stiff getting up this morning, but he ate well and wagged for his walk.",
    },
    {
      threadId: thread.id, role: "assistant",
      text: "Noted — I've saved that to today's journal. A good appetite and a wag are lovely signs. One thing I'm holding onto for you:",
      cards: [
        { type: "logged" },
        {
          type: "recall",
          occurrences: [
            { date: "May 22", weight: 16, text: "Slow to rise this morning, eased up after a short walk." },
            { date: "May 30", weight: 22, text: "Stiff getting up again — better once moving." },
            { date: "Jun 4", weight: 27, text: "Harder to get up from the floor today, mornings seem worse." },
          ],
        },
      ],
    },
    { threadId: thread.id, role: "owner", text: "How's his mobility doing overall?" },
    {
      threadId: thread.id, role: "assistant",
      text: "Oscar is doing better than his own baseline this week — about 8 points better, which is past the mark Goldvale treats as meaningful. Worth mentioning at your next visit, not a diagnosis.",
      cards: [{ type: "mobility", series: [42, 40, 39, 37, 36, 34], improvement: 8 }],
    },
  ]);

  console.log("✓ Seeded companion starter conversation for Oscar (thread", thread.id + ").");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
