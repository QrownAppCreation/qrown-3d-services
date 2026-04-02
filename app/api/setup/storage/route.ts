/**
 * ONE-TIME setup route — creates the Supabase Storage bucket "order-photos".
 *
 * Call once after deploying:
 *   GET https://wedprint3d.com/api/setup/storage?secret=WedPrint2026
 *
 * The bucket is set to PUBLIC so photos are accessible via a plain URL
 * (no signed URL needed in the operator dashboard).
 */
import { NextRequest, NextResponse } from "next/server";
import { getStorageAdmin, BUCKET } from "@/lib/supabase-storage";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.OPERATOR_SEED_PASSWORD ?? "WedPrint2026";

  if (secret !== expected) {
    return NextResponse.json({ error: "Wrong or missing ?secret= parameter" }, { status: 401 });
  }

  try {
    const supabase = getStorageAdmin();

    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;

    const exists = buckets?.some((b) => b.name === BUCKET);

    if (exists) {
      return NextResponse.json({
        ok: true,
        message: `Bucket "${BUCKET}" already exists — nothing to do.`,
      });
    }

    // Create as a public bucket (photos are readable without authentication)
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 20_971_520, // 20 MB per file
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
    });

    if (createError) throw createError;

    console.log(`[setup/storage] Bucket "${BUCKET}" created successfully.`);

    return NextResponse.json({
      ok: true,
      message: `Bucket "${BUCKET}" created successfully. Photo uploads are now live.`,
    });
  } catch (err) {
    console.error("[setup/storage] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
