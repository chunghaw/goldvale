/**
 * Open/close the Aurora security group for the public Vercel demo.
 *   npx tsx --env-file=.env scripts/sg-demo.ts open    # allow 5432 from anywhere
 *   npx tsx --env-file=.env scripts/sg-demo.ts close   # re-lock (remove that rule)
 *
 * ⚠️ "open" exposes Postgres to the internet (0.0.0.0/0). It's guarded by a strong
 * master password + SSL and the demo holds no real PII — but re-lock with "close"
 * once the hackathon is over.
 */
import {
  EC2Client,
  AuthorizeSecurityGroupIngressCommand,
  RevokeSecurityGroupIngressCommand,
} from "@aws-sdk/client-ec2";

const SG_ID = "sg-04ed2dff46b24c2c3"; // goldvale-db-sg
const PERMISSION = {
  IpProtocol: "tcp",
  FromPort: 5432,
  ToPort: 5432,
  IpRanges: [{ CidrIp: "0.0.0.0/0", Description: "Vercel demo (temporary)" }],
};

async function main() {
  const action = (process.argv[2] ?? "open").toLowerCase();
  const client = new EC2Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  try {
    if (action === "open") {
      await client.send(new AuthorizeSecurityGroupIngressCommand({ GroupId: SG_ID, IpPermissions: [PERMISSION] }));
      console.log("✓ Opened 5432 → 0.0.0.0/0 on", SG_ID);
    } else if (action === "close") {
      await client.send(new RevokeSecurityGroupIngressCommand({ GroupId: SG_ID, IpPermissions: [PERMISSION] }));
      console.log("✓ Closed (revoked 0.0.0.0/0 rule) on", SG_ID);
    } else {
      throw new Error(`unknown action "${action}" — use open|close`);
    }
  } catch (e) {
    const msg = (e as Error).message;
    if (/Duplicate/i.test(msg)) console.log("• Rule already present — nothing to do.");
    else if (/NotFound|does not exist/i.test(msg)) console.log("• Rule not present — nothing to revoke.");
    else throw e;
  }
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
