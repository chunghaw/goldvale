/**
 * S3 media storage — private bucket, served via short-lived presigned GET urls.
 * Server-only (uses the AWS creds). Upload is done server-side (small images/clips).
 */
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function bucket(): string {
  const b = process.env.S3_BUCKET;
  if (!b) throw new Error("S3_BUCKET not set");
  return b;
}

let _client: S3Client | null = null;
function client(): S3Client {
  if (_client) return _client;
  _client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  return _client;
}

/** Upload bytes; returns the object key. */
export async function putObject(key: string, body: Buffer, contentType: string): Promise<string> {
  await client().send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType }));
  return key;
}

/** A presigned GET url for an object (default 1h) — usable as an <img>/<video> src. */
export async function presignGet(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(client(), new GetObjectCommand({ Bucket: bucket(), Key: key }), { expiresIn });
}

/** Decode a data: URL into bytes + mime. */
export function decodeDataUrl(dataUrl: string): { buffer: Buffer; contentType: string } {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error("expected a base64 data URL");
  return { contentType: m[1], buffer: Buffer.from(m[2], "base64") };
}
