import { S3Client } from "@aws-sdk/client-s3";

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export function getR2Config() {
  const accountId = getRequiredEnv("R2_ACCOUNT_ID");
  const accessKeyId = getRequiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("R2_SECRET_ACCESS_KEY");
  const bucketName = process.env.R2_BUCKET_NAME?.trim() || process.env.R2_BUCKET?.trim();
  if (!bucketName) {
    throw new Error("R2_BUCKET_NAME (or legacy R2_BUCKET) is not configured.");
  }
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    endpoint,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL?.trim() || null,
  };
}

export function createR2Client() {
  const cfg = getR2Config();

  return new S3Client({
    region: "auto",
    endpoint: cfg.endpoint,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
}
