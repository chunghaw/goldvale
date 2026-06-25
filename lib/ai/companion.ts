/**
 * The Oscar companion agent — a non-clinical scribe/vet-prep assistant.
 *
 * Bedrock Claude (Sonnet 4.6) with tool-use against Aurora: it logs observations to
 * the journal, recalls the owner's own past notes (pgvector), narrates their own
 * mobility trend, flags things for the vet, and escalates red flags. It NEVER
 * diagnoses — the final reply is run through the non-clinical guardrail before it
 * leaves this module, and each tool call surfaces a "rich card" for the UI.
 */
import { generateText, tool, stepCountIs, type ModelMessage } from "ai";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { chatModel, embedText } from "@/lib/ai/bedrock";
import { assertNonClinical, checkNonClinical } from "@/lib/domain/guardrails";
import { bandFor } from "@/lib/domain/mobility";
import { getDb } from "@/lib/db/client";
import { journalEntries, mobilityScoreEvents } from "@/lib/db/schema";
import { recallSimilarJournal } from "@/lib/data/queries";

export type CompanionCard =
  | { type: "logged" }
  | { type: "vetbrief" }
  | { type: "redflag" }
  | { type: "recall"; occurrences: { date: string; weight: number; text: string }[] }
  | { type: "mobility"; series: number[]; improvement: number };

export interface ChatTurn {
  role: "owner" | "assistant";
  text: string;
}

export interface CompanionReply {
  text: string;
  cards: CompanionCard[];
}

/**
 * Upper bounds on the free-text the agent feeds its tools.
 *
 *   journal:  ~2000 chars covers a long observation paragraph; longer means a
 *             malformed prompt or someone pasting raw logs — cap to bound the
 *             embedding cost + injection surface.
 *   query:    recall is a single phrase ("stiff getting up") — 500 chars is
 *             already generous.
 */
export const COMPANION_TOOL_LIMITS = { journal: 2000, query: 500 } as const;

/**
 * Safe fallback the chat shows when the agent or one of its tools fails. Must
 * stay non-clinical and route real concern back to the vet — verified at module
 * load so a careless edit can't ship clinical copy by accident.
 */
export const COMPANION_FALLBACK_TEXT =
  "Something went sideways on my side just now, and I couldn't put a full reply together. Your message is saved — and if anything feels urgent, please contact your vet.";
assertNonClinical(COMPANION_FALLBACK_TEXT);

const COMPANION_FALLBACK: CompanionReply = { text: COMPANION_FALLBACK_TEXT, cards: [] };

/**
 * Run the companion agent and swallow any thrown error into the safe fallback
 * reply. Use this from the action layer so a Bedrock hiccup, DB outage, or
 * unexpected agent crash never throws to the client mid-chat.
 */
export async function withCompanionFallback(
  fn: () => Promise<CompanionReply>,
): Promise<CompanionReply> {
  try {
    return await fn();
  } catch (err) {
    console.error("[companion] failed; returning safe fallback:", err);
    return { ...COMPANION_FALLBACK };
  }
}

const SYSTEM = (petName: string) => `You are a calm, caring companion for the owner of a senior or chronically-ill pet named ${petName}.
You are a COMPANION, SCRIBE, and VET-PREP assistant — NOT a veterinarian. You NEVER diagnose, grade, stage, or prescribe, and you never say what a condition "is".

How to help:
- When the owner reports an observation about ${petName}, call logToJournal to save it, then reply warmly and briefly.
- When they ask whether something has happened before, or about patterns, call recallPastNotes.
- When they ask how ${petName} is doing or about the trend, call getMobilityTrend and narrate it ONLY relative to ${petName}'s own baseline. The mobility scale (GenPup-M) is HIGHER = WORSE, so a LOWER score is BETTER; use the tool's 'direction'/'betterThanBaseline' fields and never describe a lower score as worse (e.g. current 34 vs baseline 42 = "8 points better than baseline"). Never frame it as a condition.
- When something is worth raising at the next vet visit, call addVetBriefQuestion.
- If they describe a possible emergency or red flag (sudden inability to bear weight, collapse, loss of coordination, can't urinate, severe distress, bleeding), call escalateToVet and tell them to contact their vet now. Do NOT assess it.
- For a photo, say you've saved it and can't assess it; name observable things worth the vet seeing (redness/heat/discharge/swelling) and offer to flag it. Never interpret the image as a condition.
- If a tool returns ok: false, tell the owner honestly that the note couldn't be saved this time and they can try again. Never claim something was saved when the tool reported it wasn't.

Keep replies short, warm, and plain — 1–3 conversational sentences. Write plain text only: NO markdown, asterisks, bold, headings, bullet/numbered lists, or emoji (they render as raw characters in the chat). If you need to offer examples, weave them into a sentence rather than listing them. Always route real concern back to the vet.`;

export async function runCompanion(opts: {
  petId: string;
  petName: string;
  history: ChatTurn[];
  /** an image attached to the latest owner message, for the agent to see (non-clinically) */
  image?: { base64: string; mediaType: string };
}): Promise<CompanionReply> {
  const { petId, petName, history, image } = opts;
  const db = getDb();
  const cards: CompanionCard[] = [];

  // Each tool's execute is wrapped: an embedText/DB hiccup must NOT throw out of
  // the agent loop. We return a graceful "didn't work" shape so the model can
  // still narrate around it, and the user always gets a reply.
  const onToolError = (name: string, err: unknown) => {
    console.warn(`[companion] tool '${name}' failed:`, err instanceof Error ? err.message : err);
  };

  const tools = {
    logToJournal: tool({
      description: "Save an observation the owner just reported to the pet's journal record.",
      inputSchema: z.object({
        text: z.string().min(1).max(COMPANION_TOOL_LIMITS.journal)
          .describe("the observation, in plain words"),
      }),
      execute: async ({ text }: { text: string }) => {
        try {
          const embedding = await embedText(text);
          await db.insert(journalEntries).values({ petId, text, embedding });
          cards.push({ type: "logged" });
          return { ok: true };
        } catch (err) {
          onToolError("logToJournal", err);
          return { ok: false, error: "could_not_log" };
        }
      },
    }),
    recallPastNotes: tool({
      description: "Find the owner's own past journal notes that resemble a topic, to surface a pattern.",
      inputSchema: z.object({
        query: z.string().min(1).max(COMPANION_TOOL_LIMITS.query)
          .describe("what to look for, e.g. 'stiff getting up'"),
      }),
      execute: async ({ query }: { query: string }) => {
        try {
          const hits = await recallSimilarJournal(petId, query, 3);
          cards.push({ type: "recall", occurrences: hits.map((h, i) => ({ date: h.date, weight: 16 + i * 5, text: h.text })) });
          return { found: hits.map((h) => ({ date: h.date, text: h.text })) };
        } catch (err) {
          onToolError("recallPastNotes", err);
          return { found: [] };
        }
      },
    }),
    getMobilityTrend: tool({
      description: "Get the pet's recent mobility scores (their OWN trend) to narrate relative to baseline.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const rows = await db.select().from(mobilityScoreEvents)
            .where(eq(mobilityScoreEvents.petId, petId)).orderBy(asc(mobilityScoreEvents.recordedAt));
          const series = rows.map((r) => Number(r.totalScore));
          if (!series.length) return { available: false };
          const baseline = series[0], current = series[series.length - 1];
          const improvement = baseline - current; // GenPup-M is higher = worse → positive = better
          cards.push({ type: "mobility", series, improvement });
          return {
            current, baseline, improvement,
            betterThanBaseline: improvement > 0,
            direction: improvement > 0 ? "better" : improvement < 0 ? "worse" : "steady",
            band: bandFor(current),
            scaleNote: "GenPup-M runs 0–108 where a LOWER score is BETTER. 'improvement' is baseline minus current, so a positive value means the pet is doing BETTER than its own baseline. Never describe a lower score as worse.",
          };
        } catch (err) {
          onToolError("getMobilityTrend", err);
          return { available: false };
        }
      },
    }),
    addVetBriefQuestion: tool({
      description: "Flag a question or item to raise at the next vet visit.",
      inputSchema: z.object({
        question: z.string().min(1).max(COMPANION_TOOL_LIMITS.journal),
      }),
      execute: async ({ question }: { question: string }) => {
        try {
          const text = `For the vet: ${question}`;
          const embedding = await embedText(text);
          await db.insert(journalEntries).values({ petId, text, embedding });
          cards.push({ type: "vetbrief" });
          return { ok: true };
        } catch (err) {
          onToolError("addVetBriefQuestion", err);
          return { ok: false, error: "could_not_log" };
        }
      },
    }),
    escalateToVet: tool({
      description: "Use when the owner describes a possible emergency or red flag. Routes them to the vet; never assess it.",
      inputSchema: z.object({
        reason: z.string().min(1).max(COMPANION_TOOL_LIMITS.journal),
      }),
      execute: async () => {
        cards.push({ type: "redflag" });
        return { guidance: "Contact your vet now." };
      },
    }),
  };

  const messages: ModelMessage[] = history.map((h) => ({
    role: h.role === "owner" ? "user" : "assistant",
    content: h.text,
  }));
  // attach the image to the latest owner message so Claude can see it
  const last = messages[messages.length - 1];
  if (image && last && last.role === "user") {
    last.content = [
      { type: "text", text: typeof last.content === "string" ? last.content : "" },
      { type: "image", image: image.base64, mediaType: image.mediaType },
    ];
  }

  const res = await generateText({
    model: chatModel(),
    system: SYSTEM(petName),
    messages,
    tools,
    stopWhen: stepCountIs(5),
  });

  let text = res.text?.trim() || "I've made a note of that.";
  if (!checkNonClinical(text).ok) {
    text = "I can't speak to what that might be — but I've made a note, and it's worth raising with your vet.";
  }
  return { text, cards };
}
