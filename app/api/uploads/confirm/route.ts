import { NextRequest, NextResponse } from "next/server";
import { getPublicUrl } from "@/lib/storage";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, photoType, fileKey } = body;

    if (!orderId || !photoType || !fileKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { designs: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const publicUrl = getPublicUrl(fileKey);

    // Update the design's photoUrls JSON
    const design = order.designs[0];
    if (design) {
      const currentUrls = (design.photoUrls as Record<string, string>) ?? {};
      await db.design.update({
        where: { id: design.id },
        data: {
          photoUrls: { ...currentUrls, [photoType]: publicUrl },
        },
      });
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error("Confirm upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
