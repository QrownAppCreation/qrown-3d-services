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
 * Upload a file buffer to Supabase Storage and return the permanent public URL.
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

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mime,
    upsert: true,        // overwrite if the same draft re-uploads
  });

  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
