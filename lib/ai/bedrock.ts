/**
 * Amazon Bedrock adapters (Vercel AI SDK) — chat narration + embeddings.
 *
 * The narrator NEVER computes clinical scores; those are precomputed in lib/domain
 * and passed in. narrateSafe() enforces the non-clinical guardrail on every output
 * before it can reach a user.
 */
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { generateText, embed, embedMany } from "ai";
import { assertNonClinical } from "@/lib/domain/guardrails";

function provider() {
  return createAmazonBedrock({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
}

function chatModel() {
  const id = process.env.BEDROCK_CHAT_MODEL;
  if (!id) throw new Error("BEDROCK_CHAT_MODEL not set");
  return provider()(id);
}

function embeddingModel() {
  const id = process.env.BEDROCK_EMBED_MODEL;
  if (!id) throw new Error("BEDROCK_EMBED_MODEL not set");
  return provider().textEmbeddingModel(id);
}

export const NON_CLINICAL_SYSTEM =
  "You are Goldvale, a calm companion for owners of senior or chronically-ill pets. " +
  "You NEVER diagnose, grade, stage, or prescribe. You narrate trends in plain, warm language " +
  "and pose 'questions to discuss with your vet'. Clinical scores are given to you precomputed — " +
  "never invent, compute, or reinterpret them. Always route any concern back to the vet.";

export async function narrate(prompt: string, system: string = NON_CLINICAL_SYSTEM): Promise<string> {
  const { text } = await generateText({ model: chatModel(), system, prompt });
  return text;
}

/** Narrate AND enforce the non-clinical guardrail before returning. */
export async function narrateSafe(prompt: string, system?: string): Promise<string> {
  const text = await narrate(prompt, system);
  assertNonClinical(text);
  return text;
}

export async function embedText(value: string): Promise<number[]> {
  const { embedding } = await embed({ model: embeddingModel(), value });
  return embedding;
}

export async function embedTexts(values: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({ model: embeddingModel(), values });
  return embeddings;
}
