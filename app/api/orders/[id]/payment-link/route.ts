import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { sendBalancePaymentEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: Context) {
  // Only operators can trigger a balance collection
  const session = await auth();
  if (!session || session.user.role !== "operator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: orderId } = await params;

  // Fetch the order with couple info
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { couple: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.balanceCents <= 0) {
    return NextResponse.json(
      { error: "This order has no outstanding balance" },
      { status: 400 }
    );
  }

  const shortId = orderId.slice(-8).toUpperCase();

  try {
    // Create a one-time Stripe Checkout Session for the remaining balance.
    // We tag it with type:"balance" so the webhook knows what to do.
    const stripeSession = await getStripe().checkout.sessions.create({
      mode:           "payment",
      customer_email: order.couple.email,
      line_items: [
        {
          price_data: {
            currency:     "usd",
            product_data: {
              name:        `WedPrint Order #${shortId} — Remaining Balance`,
              description: `Final payment for your custom ${order.styleTier.toLowerCase()} piece`,
            },
            unit_amount: order.balanceCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId,
        type: "balance",   // tells webhook this is a balance payment, not a deposit
      },
      success_url: `${APP_URL}/order-confirmed?balance_paid=1`,
      cancel_url:  `${APP_URL}/`,
    });

    const paymentUrl = stripeSession.url!;

    // Email the payment link directly to the couple
    console.log(`[payment-link] Emailing balance link to ${order.couple.email} …`);
    await sendBalancePaymentEmail({
      email:        order.couple.email,
      coupleName:   order.couple.name,
      balanceCents: order.balanceCents,
      paymentUrl,
      orderId,
    });
    console.log(`[payment-link] Balance email sent for order ${shortId}`);

    return NextResponse.json({
      ok:         true,
      paymentUrl,
      sentTo:     order.couple.email,
      balanceCents: order.balanceCents,
    });
  } catch (err) {
    console.error("[payment-link] Error:", err);
    return NextResponse.json(
      { error: "Could not create payment link", detail: String(err) },
      { status: 500 }
    );
  }
}
