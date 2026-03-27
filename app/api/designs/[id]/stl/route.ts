import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// R2 storage is optional — fall back to a local placeholder when not configured.
// In production, configure R2_* env vars to enable real cloud storage.
const R2_CONFIGURED =
  !!(process.env.R2_ACCOUNT_ID &&
     process.env.R2_ACCESS_KEY_ID &&
     process.env.R2_SECRET_ACCESS_KEY &&
     process.env.R2_BUCKET_NAME);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: designId } = await params;
    const formData = await req.formData();
    const file    = formData.get("file") as File | null;
    const orderId = formData.get("orderId") as string;

    if (!file || !orderId) {
      return NextResponse.json({ error: "Missing file or orderId" }, { status: 400 });
    }

    // Validate file type
    const name = file.name.toLowerCase();
    if (!name.endsWith(".stl") && !name.endsWith(".obj")) {
      return NextResponse.json({ error: "Only .stl and .obj files are accepted." }, { status: 400 });
    }

    const design = await db.design.findUnique({ where: { id: designId } });
    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    let stlUrl: string;

    if (R2_CONFIGURED) {
      // ── Real R2 upload ───────────────────────────────────────────────────────
      const { createPresignedUploadUrl, getPublicUrl, buildDesignKey } =
        await import("@/lib/storage");

      const ext     = file.name.split(".").pop() ?? "stl";
      const fileKey = buildDesignKey(orderId, designId, `final.${ext}`);
      const presignedUrl = await createPresignedUploadUrl(fileKey, file.type || "model/stl");
      const buffer  = await file.arrayBuffer();

      await fetch(presignedUrl, {
        method: "PUT",
        body:   buffer,
        headers: { "Content-Type": file.type || "model/stl" },
      });

      stlUrl = getPublicUrl(fileKey);
    } else {
      // ── Dev fallback: store filename as placeholder ──────────────────────────
      // R2 not configured — record the filename so the UI can show it.
      // Configure R2_* env vars to enable real file storage.
      stlUrl = `local://${file.name}`;
    }

    await db.design.update({
      where: { id: designId },
      data: {
        stlUrl,
        cleanedMeshUrl: stlUrl,
        status: "REVIEW",
      },
    });

    return NextResponse.json({
      success: true,
      stlUrl,
      fileName:  file.name,
      uploadedAt: new Date().toISOString(),
      storedIn:  R2_CONFIGURED ? "r2" : "placeholder",
    });
  } catch (err) {
    console.error("STL upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
