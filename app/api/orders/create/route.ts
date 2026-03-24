import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import type { OrderDraft, AddOnKey } from "@/lib/order-store";
import { ADDON_PRICES } from "@/lib/order-store";
import { AddOnType, StyleTier } from "@prisma/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, draft } = body as {
      email: string;
      name: string;
      draft: OrderDraft;
    };

    if (!email || !name || !draft) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const qty = draft.quantity ?? 1;
    const basePriceCents = 7900;
    const totalCents = draft.totalCents ?? basePriceCents * qty;
    const depositCents = draft.depositCents ?? Math.round(totalCents * 0.5);
    const balanceCents = totalCents - depositCents;

    // Build add-on input list before entering the transaction
    const addOnInputs: { type: AddOnType; priceCents: number; quantity: number }[] = [];
    if (draft.addOns) {
      for (const [key, selected] of Object.entries(draft.addOns)) {
        if (!selected) continue;
        const k = key as AddOnKey;
        addOnInputs.push({
          type: k as AddOnType,
          priceCents: k === "RUSH_ORDER" ? Math.round(totalCents * 0.5) : ADDON_PRICES[k] * qty,
          quantity: qty,
        });
      }
    }

    // One atomic transaction — eliminates concurrent write lock conflicts
    const order = await db.$transaction(async (tx) => {
      const couple = await tx.couple.upsert({
        where: { email },
        update: { name },
        create: { email, name },
      });

      const newOrder = await tx.order.create({
        data: {
          coupleId: couple.id,
          status: "PENDING_PAYMENT",
          depositCents,
          balanceCents,
          weddingDate: draft.weddingDate ? new Date(draft.weddingDate) : null,
          colorPalette: draft.colorPalette ?? null,
          styleNotes: draft.styleNotes ?? null,
          styleTier: (draft.styleTier as StyleTier) ?? "ELEGANT",
        },
      });

      await tx.design.create({
        data: {
          orderId: newOrder.id,
          category: "CAKE_TOPPER",
          quantity: qty,
          generationMethod: "AI_PHOTO",
          status: "QUEUED",
          photoUrls: draft.photoUrls ?? {},
          partner1Name: draft.partner1Name ?? null,
          partner2Name: draft.partner2Name ?? null,
        },
      });

      if (addOnInputs.length > 0) {
        await tx.addOn.createMany({
          data: addOnInputs.map((a) => ({ ...a, orderId: newOrder.id })),
        });
      }

      return newOrder;
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Custom Cake Topper — 50% deposit (${draft.styleTier ?? "Elegant"})`,
            },
            unit_amount: depositCents,
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: order.id },
      success_url: `${APP_URL}/order/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/order/step5-payment`,
    });

    return NextResponse.json({ checkoutUrl: session.url, orderId: order.id });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json(
      { error: "Could not create order" },
      { status: 500 }
    );
  }
}
