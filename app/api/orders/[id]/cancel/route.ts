import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { sendCancellationEmail } from "@/lib/email";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  // Operator-only route
  const session = await auth();
  if (!session || session.user.role !== "operator") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const order = await db.order.findUnique({
      where: { id },
      include: { couple: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json({ error: "Order is already cancelled" }, { status: 400 });
    }

    if (order.status === "COMPLETE") {
      return NextResponse.json({ error: "Cannot cancel a completed order" }, { status: 400 });
    }

    // ── Issue Stripe refund if a deposit was charged ─────────────────────────
    let refundAmountCents = 0;

    if (order.stripePaymentId) {
      try {
        console.log(`[cancel] Issuing Stripe refund for payment intent ${order.stripePaymentId}`);
        const refund = await getStripe().refunds.create({
          payment_intent: order.stripePaymentId,
        });
        refundAmountCents = refund.amount;
        console.log(`[cancel] Refund issued: ${refund.id} — ${refund.amount} cents`);
      } catch (stripeErr) {
        console.error("[cancel] Stripe refund failed:", stripeErr);
        // Return the error so the operator knows it failed — don't cancel the DB record
        const msg = stripeErr instanceof Error ? stripeErr.message : "Stripe refund failed";
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    } else {
      // No payment was taken (still PENDING_PAYMENT) — just cancel the record
      console.log(`[cancel] No Stripe payment on record — cancelling without refund`);
    }

    // ── Update order status ──────────────────────────────────────────────────
    await db.order.update({
      where: { id },
      data:  { status: "CANCELLED" },
    });

    // ── Send cancellation email to the couple ────────────────────────────────
    try {
      await sendCancellationEmail({
        email:             order.couple.email,
        coupleName:        order.couple.name,
        orderId:           order.id,
        refundAmountCents: refundAmountCents > 0 ? refundAmountCents : order.depositCents,
      });
      console.log(`[cancel] Cancellation email sent to ${order.couple.email}`);
    } catch (emailErr) {
      // Don't fail the request just because the email errored
      console.error("[cancel] Cancellation email failed:", emailErr);
    }

    return NextResponse.json({
      ok:                true,
      refundAmountCents,
      message:           `Order cancelled. Refund of $${(refundAmountCents / 100).toFixed(2)} issued.`,
    });
  } catch (err) {
    console.error("[cancel] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
