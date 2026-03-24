import { NextRequest, NextResponse } from "next/server";
import { createPresignedUploadUrl, buildPhotoKey } from "@/lib/storage";
import { db } from "@/lib/db";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const MAX_SIZE_BYTES = 20_000_000; // 20MB

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, photoType, fileType, fileSizeBytes, ext } = body;

    if (!orderId || !photoType || !fileType || !fileSizeBytes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: "File type not allowed. Use JPG, PNG, WebP, or HEIC." },
        { status: 400 }
      );
    }

    if (fileSizeBytes > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum is 20MB." },
        { status: 400 }
      );
    }

    // Verify the order exists
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const fileKey = buildPhotoKey(orderId, photoType, ext ?? "jpg");
    const presignedUrl = await createPresignedUploadUrl(fileKey, fileType);

    return NextResponse.json({ presignedUrl, fileKey });
  } catch (err) {
    console.error("Presign error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
