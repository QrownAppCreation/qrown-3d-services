import { NextRequest, NextResponse } from "next/server";
import { checkoutSessionPaymentIntentId, getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendOrderConfirmationEmail, sendOperatorNotification } from "@/lib/email";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  // Raw text body is required for Stripe signature verification
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── checkout.session.completed ────────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId     = session.metadata?.orderId;
    const paymentType = session.metadata?.type ?? "deposit"; // "deposit" | "balance"

    if (!orderId) {
      console.error("Webhook: no orderId in session metadata", session.id);
      return NextResponse.json({ received: true });
    }

    // ── Balance payment ────────────────────────────────────────────────────
    if (paymentType === "balance") {
      try {
        await db.order.update({
          where: { id: orderId },
          data:  { status: "BALANCE_PAID" },
        });
        console.log(`Webhook: order ${orderId} → BALANCE_PAID`);
        await sendOperatorNotification(
          `Balance payment received for order #${orderId.slice(-8).toUpperCase()}`,
          orderId
        );
      } catch (err) {
        console.error("Webhook: error handling balance payment:", err);
      }
      return NextResponse.json({ received: true });
    }

    // ── Deposit payment (original flow) ───────────────────────────────────
    try {
      const paymentIntentId = await checkoutSessionPaymentIntentId(session);
      if (!paymentIntentId) {
        console.error("Webhook: could not resolve payment_intent for session", session.id);
      }
      const order = await db.order.update({
        where: { id: orderId },
        data: {
          status:          "PAID",
          stripeSessionId: session.id,
          ...(paymentIntentId ? { stripePaymentId: paymentIntentId } : {}),
        },
        include: {
          couple: {
            select: {
              email:          true,
              name:           true,
              magicLinkToken: true,
            },
          },
          designs: {
            select: {
              category:     true,
              quantity:     true,
              partner1Name: true,
              partner2Name: true,
            },
          },
          addOns: true,
        },
      });

      const productLines = order.designs.map(
        (d) => `${d.category.replace(/_/g, " ")} ×${d.quantity}`
      );
      const addOnLines = order.addOns.map(
        (a) => `${a.type.replace(/_/g, " ")} ×${a.quantity}`
      );
      const firstDesign = order.designs[0];

      const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const magicLinkUrl = order.couple.magicLinkToken
        ? `${appUrl}/my-order?token=${order.couple.magicLinkToken}`
        : null;

      await sendOrderConfirmationEmail({
        email:            order.couple.email,
        coupleName:       order.couple.name,
        partner1Name:     firstDesign?.partner1Name ?? null,
        partner2Name:     firstDesign?.partner2Name ?? null,
        orderId,
        depositPaidCents: order.depositCents,
        balanceDueCents:  order.balanceCents,
        productLines,
        addOnLines,
        magicLinkUrl,
      });

      await sendOperatorNotification(
        `New paid order from ${order.couple.name} (${order.couple.email}) — deposit $${(order.depositCents / 100).toFixed(2)}`,
        orderId
      );

      await db.order.update({
        where: { id: orderId },
        data:  { status: "IN_DESIGN" },
      });
    } catch (err) {
      console.error("Error processing checkout.session.completed (deposit):", err);
      return NextResponse.json({ received: true });
    }
  }

  // ── payment_intent.payment_failed ─────────────────────────────────────────
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      const order = await db.order.findFirst({
        where: { stripePaymentId: paymentIntent.id },
      });

      if (order) {
        await db.order.update({
          where: { id: order.id },
          data: { status: "PENDING_PAYMENT" },
        });
      }
    } catch (err) {
      console.error("Error handling payment_intent.payment_failed:", err);
    }
  }

  return NextResponse.json({ received: true });
}
