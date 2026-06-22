/**
 * Create the private S3 bucket for Oscar media (photos/videos). Idempotent.
 *   npx tsx --env-file=.env scripts/setup-s3.ts
 * Bucket stays private (Block Public Access on); the app serves objects via
 * short-lived presigned GET urls (lib/storage/s3.ts).
 */
import { S3Client, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.S3_BUCKET || "goldvale-media-609082885987";

async function main() {
  const region = process.env.AWS_REGION || "us-east-1";
  const s3 = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
    console.log(`• Bucket already exists: ${BUCKET}`);
  } catch {
    // us-east-1 must NOT send a LocationConstraint
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
    console.log(`✓ Created bucket: ${BUCKET} (${region})`);
  }
  console.log(`  Set S3_BUCKET=${BUCKET} in .env and on Vercel.`);
}
main().catch((e) => { console.error("✗", e.message); process.exit(1); });
