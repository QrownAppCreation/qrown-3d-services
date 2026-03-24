import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  createPresignedUploadUrl,
  getPublicUrl,
  buildDesignKey,
} from "@/lib/storage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: designId } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const orderId = formData.get("orderId") as string;

    if (!file || !orderId) {
      return NextResponse.json(
        { error: "Missing file or orderId" },
        { status: 400 }
      );
    }

    const design = await db.design.findUnique({ where: { id: designId } });
    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const ext = file.name.split(".").pop() ?? "stl";
    const fileKey = buildDesignKey(orderId, designId, `final.${ext}`);

    // Get presigned URL and upload
    const presignedUrl = await createPresignedUploadUrl(fileKey, file.type || "model/stl");
    const buffer = await file.arrayBuffer();

    await fetch(presignedUrl, {
      method: "PUT",
      body: buffer,
      headers: { "Content-Type": file.type || "model/stl" },
    });

    const stlUrl = getPublicUrl(fileKey);

    await db.design.update({
      where: { id: designId },
      data: {
        stlUrl,
        cleanedMeshUrl: stlUrl,
        status: "REVIEW",
      },
    });

    return NextResponse.json({ success: true, stlUrl });
  } catch (err) {
    console.error("STL upload error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
