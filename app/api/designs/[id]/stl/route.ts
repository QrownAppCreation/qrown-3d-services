import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadStlToStorage } from "@/lib/supabase-storage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── Operator-only ─────────────────────────────────────────────────────────
  const session = await auth();
  if (!session || session.user.role !== "operator") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const { id: designId } = await params;
    const formData = await req.formData();
    const file    = formData.get("file")    as File   | null;
    const orderId = formData.get("orderId") as string | null;

    if (!file || !orderId) {
      return NextResponse.json({ error: "Missing file or orderId" }, { status: 400 });
    }

    // Validate file type
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".stl") && !lowerName.endsWith(".obj")) {
      return NextResponse.json(
        { error: "Only .stl and .obj files are accepted." },
        { status: 400 }
      );
    }

    const design = await db.design.findUnique({ where: { id: designId } });
    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    // ── Upload to Supabase Storage ──────────────────────────────────────────
    // Path format: {orderId}/{filename}  (as specified)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${orderId}/${safeName}`;
    const mime = file.type || "model/stl";

    console.log(`[stl/upload] Uploading "${file.name}" (${(file.size / 1024).toFixed(0)} KB) → stl-files/${storagePath}`);

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const stlUrl = await uploadStlToStorage(storagePath, buffer, mime);

    console.log(`[stl/upload] Success: ${stlUrl}`);

    // ── Persist URL to the Design record ──────────────────────────────────
    await db.design.update({
      where: { id: designId },
      data: {
        stlUrl,
        cleanedMeshUrl: stlUrl,
        status: "REVIEW",
      },
    });

    return NextResponse.json({
      success:    true,
      stlUrl,
      fileName:   file.name,
      uploadedAt: new Date().toISOString(),
      storedIn:   "supabase",
    });
  } catch (err) {
    console.error("[stl/upload] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
