import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadStlToStorage } from "@/lib/supabase-storage";

export const runtime = "nodejs";
export const maxDuration = 120;

function jsonError(message: string, status: number) {
  console.error(`[stl/upload] responding ${status}: ${message}`);
  return NextResponse.json({ error: message }, { status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("[stl/upload] POST received", { url: req.url });

  try {
    const session = await auth();
    console.log("[stl/upload] auth ok:", !!session, "role:", session?.user?.role);
    if (!session || session.user.role !== "operator") {
      return jsonError("Unauthorised", 401);
    }

    const { id: designId } = await params;
    console.log("[stl/upload] designId:", designId);

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (parseErr) {
      console.error("[stl/upload] formData() failed:", parseErr);
      return jsonError(
        "Could not read the uploaded file. It may be too large for the server limit — try a smaller STL or ask your host to raise the body size limit.",
        413
      );
    }

    const file = formData.get("file") as File | null;
    const orderId = formData.get("orderId") as string | null;

    console.log("[stl/upload] fields:", {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      orderId: orderId ?? "(missing)",
    });

    if (!file || !orderId) {
      return jsonError("Missing file or orderId", 400);
    }

    if (file.size === 0) {
      return jsonError("Uploaded file is empty", 400);
    }

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".stl") && !lowerName.endsWith(".obj")) {
      return jsonError("Only .stl and .obj files are accepted.", 400);
    }

    const design = await db.design.findUnique({ where: { id: designId } });
    if (!design) {
      return jsonError("Design not found", 404);
    }

    if (design.orderId !== orderId) {
      return jsonError("Design does not belong to this order.", 400);
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${orderId}/${safeName}`;
    const mime = file.type || (lowerName.endsWith(".obj") ? "model/obj" : "model/stl");

    console.log(
      `[stl/upload] uploading to stl-files/${storagePath} (${(file.size / 1024).toFixed(0)} KB, ${mime})`
    );

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const stlFileUrl = await uploadStlToStorage(storagePath, buffer, mime);

    console.log("[stl/upload] Supabase public URL:", stlFileUrl);

    await db.$transaction([
      db.design.update({
        where: { id: designId },
        data: {
          stlUrl: stlFileUrl,
          cleanedMeshUrl: stlFileUrl,
          status: "REVIEW",
        },
      }),
      db.order.update({
        where: { id: orderId },
        data: { stlFileUrl },
      }),
    ]);

    console.log("[stl/upload] database updated for design", designId, "order", orderId);

    const payload = {
      success: true,
      url: stlFileUrl,
      stlFileUrl,
      stlUrl: stlFileUrl,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      storedIn: "supabase",
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[stl/upload] error:", err);
    const message =
      err instanceof Error ? err.message : "Upload failed";
    return jsonError(message, 500);
  }
}
