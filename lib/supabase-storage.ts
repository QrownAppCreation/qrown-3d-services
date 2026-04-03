import { createClient } from "@supabase/supabase-js";

// ── Config ────────────────────────────────────────────────────────────────────
// Set these in Vercel env vars:
//   NEXT_PUBLIC_SUPABASE_URL  = https://<your-ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY = the service_role JWT from Supabase dashboard
//
// The service role key is NEVER sent to the browser — it only runs in API routes.

export const BUCKET = "order-photos";

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

/**
 * Ensure the "order-photos" bucket exists and is public.
 * Creates it automatically on first use so no manual setup step is needed.
 */
async function ensureBucket() {
  const supabase = getStorageAdmin();

  // Check if the bucket already exists
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.warn("[supabase-storage] Could not list buckets:", listErr.message);
    return; // proceed anyway — the upload will surface a clear error if needed
  }

  const exists = buckets?.some((b) => b.name === BUCKET);
  if (exists) return;

  // Create as public so photos are readable via a plain URL (no signed links needed)
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 20_971_520, // 20 MB
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ],
  });

  if (createErr) {
    // "already exists" race condition is fine — swallow it
    if (!createErr.message.toLowerCase().includes("already")) {
      console.error("[supabase-storage] Failed to create bucket:", createErr.message);
    }
  } else {
    console.log(`[supabase-storage] Bucket "${BUCKET}" created successfully.`);
  }
}

/**
 * Upload a file buffer to Supabase Storage and return the permanent public URL.
 * The bucket is created automatically if it does not exist yet.
 *
 * @param path   Storage path inside the bucket, e.g. "drafts/abc123/partner1/ts-photo.jpg"
 * @param buffer File contents as a Buffer
 * @param mime   MIME type, e.g. "image/jpeg"
 */
export async function uploadToStorage(
  path: string,
  buffer: Buffer,
  mime: string
): Promise<string> {
  const supabase = getStorageAdmin();

  // Auto-create bucket on first upload — no manual /api/setup/storage call needed
  await ensureBucket();

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mime,
    upsert: true, // overwrite if the same draft re-uploads
  });

  if (error) {
    console.error("[supabase-storage] Upload error:", error);
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
