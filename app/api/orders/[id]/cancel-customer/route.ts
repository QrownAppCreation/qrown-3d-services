import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refundDepositViaStripe } from "@/lib/order-cancellation";
import { sendCancellationEmail } from "@/lib/email";

interface Props {
  params: Promise<{ id: string }>;
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const DAY_MS      = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest, { params }: Props) {
  const { id: orderId } = await params;

  let token: string | undefined;
  try {
    const body = await req.json();
    token = body.token as string | undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!token?.trim()) {
    return NextResponse.json({ error: "Missing tracking token" }, { status: 400 });
  }

  try {
    const couple = await db.couple.findFirst({
      where: {
        magicLinkToken: token.trim(),
        tokenExpiry:    { gt: new Date() },
      },
    });

    if (!couple) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { couple: true },
    });

    if (!order || order.coupleId !== couple.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json({ error: "This order is already cancelled." }, { status: 400 });
    }

    if (order.status === "COMPLETE") {
      return NextResponse.json(
        { error: "Completed orders cannot be cancelled online. Please contact us." },
        { status: 400 }
      );
    }

    const created = order.createdAt.getTime();
    const elapsed = Date.now() - created;

    let refundCents = 0;
    let policyNote: string | null = null;

    const hasPaidDeposit =
      !!order.paymentIntentId &&
      order.status !== "PENDING_PAYMENT" &&
      order.depositCents > 0;

    if (hasPaidDeposit) {
      if (elapsed < ONE_HOUR_MS) {
        refundCents = order.depositCents;
        policyNote =
          "You cancelled within 1 hour of placing your order — your full deposit is refunded.";
      } else if (elapsed < DAY_MS) {
        refundCents = Math.round(order.depositCents * 0.5);
        policyNote =
          "You cancelled between 1 and 24 hours after ordering — 50% of your deposit is refunded. The remaining 50% covers design setup.";
      } else {
        refundCents = 0;
        policyNote =
          "Per our policy, deposits are non-refundable after 24 hours. Your order is cancelled; no refund was issued.";
      }
    }

    let actualRefundCents = 0;
    if (refundCents > 0) {
      try {
        actualRefundCents = await refundDepositViaStripe(order.paymentIntentId, refundCents);
      } catch (stripeErr) {
        console.error("[cancel-customer] Stripe refund failed:", stripeErr);
        const msg =
          stripeErr instanceof Error ? stripeErr.message : "Refund failed";
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }

    await db.order.update({
      where: { id: orderId },
      data: {
        status:             "CANCELLED",
        cancelledAt:        new Date(),
        cancellationReason: "Cancelled by customer via order tracking",
        refundAmountCents:  actualRefundCents,
        cancelledBy:        "customer",
      },
    });

    try {
      await sendCancellationEmail({
        email:             order.couple.email,
        coupleName:        order.couple.name,
        orderId:           order.id,
        refundAmountCents: actualRefundCents,
        cancelledBy:       "customer",
        cancellationReason: null,
        policyNote,
      });
    } catch (emailErr) {
      console.error("[cancel-customer] Email failed:", emailErr);
    }

    return NextResponse.json({
      ok:                true,
      refundAmountCents: actualRefundCents,
      policyNote,
      message:
        actualRefundCents > 0
          ? `Your order was cancelled. A refund of $${(actualRefundCents / 100).toFixed(2)} will appear in 3–5 business days.`
          : "Your order was cancelled.",
    });
  } catch (err) {
    console.error("[cancel-customer] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
