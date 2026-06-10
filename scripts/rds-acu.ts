/**
 * Inspect / set the Aurora Serverless v2 capacity range.
 *   npx tsx --env-file=.env scripts/rds-acu.ts            # show current min/max + status
 *   npx tsx --env-file=.env scripts/rds-acu.ts set 0.5 2  # warm floor for demo day
 *   npx tsx --env-file=.env scripts/rds-acu.ts set 0 2    # back to scale-to-zero (cheapest)
 *
 * ⚠️ MinCapacity 0.5 keeps the cluster always-on (~$0.06/ACU-hr ≈ a few $/day). For a
 * far-off deadline, leave it at 0 (scale-to-zero) and bump to 0.5 the morning of the
 * demo so the first judge request doesn't wait ~15–30s for a cold resume.
 */
import { RDSClient, DescribeDBClustersCommand, ModifyDBClusterCommand } from "@aws-sdk/client-rds";

const CLUSTER = "database-1";

async function main() {
  const client = new RDSClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  if (process.argv[2] === "set") {
    const min = Number(process.argv[3] ?? "0.5");
    const max = Number(process.argv[4] ?? "2");
    await client.send(new ModifyDBClusterCommand({
      DBClusterIdentifier: CLUSTER,
      ServerlessV2ScalingConfiguration: { MinCapacity: min, MaxCapacity: max },
      ApplyImmediately: true,
    }));
    console.log(`✓ Requested ServerlessV2 min=${min} max=${max} (applies in ~a minute).`);
    return;
  }

  const r = await client.send(new DescribeDBClustersCommand({ DBClusterIdentifier: CLUSTER }));
  const c = r.DBClusters?.[0];
  console.log("status            :", c?.Status);
  console.log("engine version    :", c?.EngineVersion);
  console.log("ServerlessV2 range:", JSON.stringify(c?.ServerlessV2ScalingConfiguration));
}

main().catch((e) => { console.error("✗", e.message); process.exit(1); });
