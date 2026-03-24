import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _r2: S3Client | null = null;

function getR2(): S3Client {
  if (!_r2) {
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      throw new Error("Cloudflare R2 credentials are not set in your .env file.");
    }
    _r2 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _r2;
}

const BUCKET = process.env.R2_BUCKET_NAME ?? "wedprint-uploads";
const CDN_BASE = process.env.R2_PUBLIC_URL ?? "";

export function getPublicUrl(key: string): string {
  return `${CDN_BASE}/${key}`;
}

export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(getR2(), command, { expiresIn });
}

export async function createPresignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(getR2(), command, { expiresIn });
}

export function buildPhotoKey(
  orderId: string,
  photoType: string,
  ext: string
): string {
  const timestamp = Date.now();
  return `orders/${orderId}/photos/${photoType}-${timestamp}.${ext}`;
}

export function buildDesignKey(
  orderId: string,
  designId: string,
  filename: string
): string {
  return `orders/${orderId}/designs/${designId}/${filename}`;
}
