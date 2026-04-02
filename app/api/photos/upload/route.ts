/**
 * POST /api/photos/upload
 *
 * Accepts a multipart form upload from the order wizard and stores the image
 * in Supabase Storage.  The service-role key stays server-side and is never
 * exposed to the browser.
 *
 * Form fields:
 *   file      - the image File
 *   photoType - "partner1" | "partner2" | "outfit" | "pet" | "inspiration"
 *   draftId   - a client-generated UUID that groups photos for one draft order
 *
 * Returns:
 *   { url: string }  — permanent public URL for the uploaded image
 */
import { NextRequest, NextResponse } from "next/server";
import { uploadToStorage } from "@/lib/supabase-storage";

const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file      = form.get("file")      as File   | null;
    const photoType = form.get("photoType") as string | null;
    const draftId   = form.get("draftId")   as string | null;

    // ── Validation ─────────────────────────────────────────────────────────
    if (!file || !photoType) {
      return NextResponse.json(
        { error: "Missing required fields: file, photoType" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Use JPG, PNG, WebP, or HEIC." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum is 20 MB." },
        { status: 400 }
      );
    }

    // ── Build storage path ──────────────────────────────────────────────────
    // drafts/{draftId}/{photoType}/{timestamp}-{safeName}
    // This groups all photos for one order draft in a predictable folder.
    const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60);
    const folder   = draftId ? `drafts/${draftId}` : `drafts/unknown-${Date.now()}`;
    const path     = `${folder}/${photoType}/${Date.now()}-${safeName}`;

    // ── Upload ────────────────────────────────────────────────────────────
    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`[photos/upload] Uploading ${photoType} (${(file.size / 1024).toFixed(0)} KB) → ${path}`);

    const publicUrl = await uploadToStorage(path, buffer, file.type);

    console.log(`[photos/upload] Success: ${publicUrl}`);

    return NextResponse.json({ url: publicUrl, path });
  } catch (err) {
    console.error("[photos/upload] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
