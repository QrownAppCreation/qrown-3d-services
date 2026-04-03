import { createClient } from "@supabase/supabase-js";

// ── Config ────────────────────────────────────────────────────────────────────
// Set these in Vercel env vars:
//   NEXT_PUBLIC_SUPABASE_URL  = https://<your-ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY = the service_role JWT from Supabase dashboard
//
// The service role key is NEVER sent to the browser — it only runs in API routes.

/** Bucket for customer reference photos uploaded during the order wizard. */
export const BUCKET = "order-photos";

/** Bucket for operator-uploaded STL / OBJ design files. */
export const STL_BUCKET = "stl-files";

/** Admin Supabase client — only use in server-side API routes. */
export function getStorageAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// ── Internal helpers ──────────────────────────────────────────────────────────

interface BucketOptions {
  /** Make the bucket publicly readable (default: true). */
  isPublic?: boolean;
  fileSizeLimit?: number;
  allowedMimeTypes?: string[];
}

/**
 * Ensure a named bucket exists, creating it if it doesn't.
 * Safe to call on every upload — exits immediately if the bucket is already there.
 */
async function ensureNamedBucket(
  bucketName: string,
  opts: BucketOptions = {}
) {
  const supabase = getStorageAdmin();

  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.warn(`[supabase-storage] Could not list buckets: ${listErr.message}`);
    return;
  }

  if (buckets?.some((b) => b.name === bucketName)) return; // already exists

  const { error: createErr } = await supabase.storage.createBucket(bucketName, {
    public:           opts.isPublic       ?? true,
    fileSizeLimit:    opts.fileSizeLimit   ?? 52_428_800, // 50 MB default
    allowedMimeTypes: opts.allowedMimeTypes,
  });

  if (createErr && !createErr.message.toLowerCase().includes("already")) {
    console.error(`[supabase-storage] Failed to create bucket "${bucketName}":`, createErr.message);
  } else if (!createErr) {
    console.log(`[supabase-storage] Bucket "${bucketName}" created.`);
  }
}

/**
 * Core upload function — used by both photo and STL helpers.
 */
async function uploadBuffer(
  bucketName: string,
  path: string,
  buffer: Buffer,
  mime: string,
  bucketOpts?: BucketOptions
): Promise<string> {
  const supabase = getStorageAdmin();
  await ensureNamedBucket(bucketName, bucketOpts);

  const { error } = await supabase.storage.from(bucketName).upload(path, buffer, {
    contentType: mime,
    upsert: true,
  });

  if (error) {
    console.error(`[supabase-storage] Upload to "${bucketName}" failed:`, error);
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data.publicUrl;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Upload a customer reference photo to the "order-photos" bucket.
 * Bucket is created automatically on first use.
 */
export async function uploadToStorage(
  path: string,
  buffer: Buffer,
  mime: string
): Promise<string> {
  return uploadBuffer(BUCKET, path, buffer, mime, {
    isPublic: true,
    fileSizeLimit: 20_971_520, // 20 MB
    allowedMimeTypes: [
      "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
    ],
  });
}

/**
 * Upload an operator STL / OBJ design file to the "stl-files" bucket.
 * Stored at path: {orderId}/{filename}
 * Bucket is created automatically on first use.
 */
export async function uploadStlToStorage(
  path: string,
  buffer: Buffer,
  mime: string
): Promise<string> {
  return uploadBuffer(STL_BUCKET, path, buffer, mime, {
    isPublic: true,         // URL is only shown inside the protected operator dashboard
    fileSizeLimit: 104_857_600, // 100 MB — STL files can be large
  });
}
