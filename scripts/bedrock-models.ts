/** Discover invokable Anthropic text models + inference profiles. Throwaway. */
import {
  BedrockClient,
  ListFoundationModelsCommand,
  ListInferenceProfilesCommand,
} from "@aws-sdk/client-bedrock";

async function main() {
  const client = new BedrockClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const models = await client.send(
    new ListFoundationModelsCommand({ byProvider: "Anthropic", byOutputModality: "TEXT" }),
  );
  console.log("── Anthropic TEXT models (ACTIVE only) ──");
  for (const m of models.modelSummaries ?? []) {
    if (m.modelLifecycle?.status !== "ACTIVE") continue;
    console.log(`${m.modelId}  [${(m.inferenceTypesSupported ?? []).join(",") || "—"}]`);
  }

  const profiles = await client.send(new ListInferenceProfilesCommand({}));
  console.log("\n── Inference profiles (Claude) ──");
  for (const p of profiles.inferenceProfileSummaries ?? []) {
    if (!/claude/i.test(p.inferenceProfileId ?? "")) continue;
    console.log(`${p.inferenceProfileId}`);
  }
}
main().catch((e) => console.error("✗", e.message));
