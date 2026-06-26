/**
 * Check-in persistence — the pure DB-write core behind the save server action.
 * Kept out of the "use server" module so it's directly testable (scripts/check-save.ts)
 * and reusable. Writes across the time-series + pgvector layers; no revalidation here.
 */
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  dailyCheckins, exerciseSessionEvents, medicationEvents, journalEntries,
  exercisePlans, planItems,
} from "@/lib/db/schema";
import { embedText } from "@/lib/ai/bedrock";
import { refreshCheckinViews } from "./refresh-mv";
import type { Tolerance } from "@/lib/domain/progression";

export interface SaveCheckinInput {
  petId: string;
  /** QoL face index 0..4 */
  qol: number;
  /** mobility item id → chosen option index */
  mobilityItems: Record<string, number>;
  /** only the exercises the owner ticked done, with their tolerance */
  exercises: { exerciseId: string; tolerance: Tolerance }[];
  /** every scheduled med with its given/skipped toggle */
  meds: { medName: string; given: boolean }[];
  note: string;
}

/**
 * Maximum allowed length of a free-text check-in note (post-trim). Bounds the
 * embedding cost on the journal-entry write and the surface area for prompt
 * injection. Generous — a long paragraph fits comfortably.
 */
export const MAX_CHECKIN_NOTE_LEN = 2000;

/**
 * Validates the free-text note at the action boundary. Trims whitespace and
 * rejects anything over MAX_CHECKIN_NOTE_LEN with a friendly, non-clinical
 * message the action can surface to the client.
 */
export function validateCheckinNote(note: string): { ok: true; note: string } | { ok: false; message: string } {
  const trimmed = note.trim();
  if (trimmed.length > MAX_CHECKIN_NOTE_LEN) {
    return {
      ok: false,
      message: `That note is a bit long for one save — try about ${MAX_CHECKIN_NOTE_LEN} characters or less and try again.`,
    };
  }
  return { ok: true, note: trimmed };
}

/**
 * Persist one check-in and its child events. Returns the new check-in id.
 *
 * The note is trimmed once here so direct callers (dev scripts, future jobs)
 * can pass raw input without each having to remember to normalize. The action
 * layer additionally bounds the length via validateCheckinNote before this
 * runs.
 */
export async function persistCheckin(input: SaveCheckinInput): Promise<string> {
  const db = getDb();
  const { petId } = input;
  const trimmedNote = input.note.trim();

  // 1) the check-in itself (QoL + rotating mobility items + note)
  const [checkin] = await db.insert(dailyCheckins).values({
    petId,
    qolScore: input.qol,
    mobilityItems: input.mobilityItems,
    note: trimmedNote || null,
  }).returning({ id: dailyCheckins.id });

  // 2) rehab sessions — resolve planned/completed reps from the active plan.
  if (input.exercises.length) {
    const [plan] = await db.select().from(exercisePlans)
      .where(and(eq(exercisePlans.petId, petId), eq(exercisePlans.status, "active")))
      .orderBy(desc(exercisePlans.createdAt)).limit(1);
    const items = plan
      ? await db.select().from(planItems).where(eq(planItems.planId, plan.id))
      : [];
    const targetReps: Record<string, number> = Object.fromEntries(
      items.map((i) => [i.exerciseId, i.targetReps ?? 0]),
    );
    await db.insert(exerciseSessionEvents).values(
      input.exercises.map((e) => ({
        petId,
        exerciseId: e.exerciseId,
        plannedReps: targetReps[e.exerciseId] ?? null,
        completedReps: targetReps[e.exerciseId] ?? null, // ticked done = completed as planned
        tolerance: e.tolerance,
      })),
    );
  }

  // 3) medication adherence toggles
  if (input.meds.length) {
    await db.insert(medicationEvents).values(
      input.meds.map((m) => ({ petId, medName: m.medName, given: m.given })),
    );
  }

  // 4) note → journal entry with a Titan embedding (feeds semantic recall)
  if (trimmedNote) {
    const embedding = await embedText(trimmedNote);
    await db.insert(journalEntries).values({ petId, text: trimmedNote, embedding });
  }

  // 5) keep the analytics layer fresh — non-fatal so a refresh hiccup never
  //    loses the check-in we just persisted (see refresh-mv.ts).
  await refreshCheckinViews(db);

  return checkin.id;
}
