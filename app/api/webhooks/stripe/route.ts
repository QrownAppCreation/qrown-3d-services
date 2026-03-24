import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import {
  sendOrderConfirmationEmail,
  sendOperatorNotification,
} from "@/lib/email";
import { formatCents } from "@/lib/order-store";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error("No orderId in session metadata");
      return NextResponse.json({ received: true });
    }

    try {
      const order = await db.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          stripePaymentId: session.payment_intent as string,
          stripeSessionId: session.id,
        },
        include: {
          couple: true,
        },
      });

      const products = [`Cake Topper (${order.styleTier.toLowerCase()})`];

      await sendOrderConfirmationEmail({
        email: order.couple.email,
        coupleName: order.couple.name,
        orderId,
        depositPaid: formatCents(order.depositCents),
        balanceDue: formatCents(order.balanceCents),
        products,
      });

      await sendOperatorNotification(
        `New paid order from ${order.couple.name} (${order.couple.email})`,
        orderId
      );

      // Update order status to IN_DESIGN
      await db.order.update({
        where: { id: orderId },
        data: { status: "IN_DESIGN" },
      });
    } catch (err) {
      console.error("Error processing paid order:", err);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      const order = await db.order.findFirst({
        where: { stripePaymentId: paymentIntent.id },
        include: { couple: true },
      });

      if (order) {
        await db.order.update({
          where: { id: order.id },
          data: { status: "PENDING_PAYMENT" },
        });
      }
    } catch (err) {
      console.error("Error handling failed payment:", err);
    }
  }

  return NextResponse.json({ received: true });
}
