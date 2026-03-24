import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Creates a minimal draft order + design record
// so we have an orderId to attach photo uploads to
export async function POST() {
  try {
    // Create a placeholder couple (will be updated at checkout)
    const placeholder = `draft-${Date.now()}@wedprint-draft.internal`;

    const couple = await db.couple.create({
      data: {
        email: placeholder,
        name: "Draft",
      },
    });

    const order = await db.order.create({
      data: {
        coupleId: couple.id,
        status: "PENDING_PAYMENT",
      },
    });

    // Create a design record to hold photos
    await db.design.create({
      data: {
        orderId: order.id,
        category: "CAKE_TOPPER",
        quantity: 1,
        generationMethod: "AI_PHOTO",
        status: "QUEUED",
      },
    });

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("Draft order error:", err);
    return NextResponse.json(
      { error: "Could not create draft order" },
      { status: 500 }
    );
  }
}
