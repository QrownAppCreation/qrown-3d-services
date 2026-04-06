import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { refundDepositViaStripe } from "@/lib/order-cancellation";
import { sendCancellationEmail } from "@/lib/email";

interface Props {
  params: Promise<{ id: string }>;
}

type RefundMode = "full" | "percent" | "flat" | "none";

export async function POST(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "operator") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;

  let body: {
    reason?: string;
    refundMode?: RefundMode;
    percent?: number;
    flatCents?: number;
  } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body — legacy clients */
  }

  const reason = (body.reason ?? "").trim();
  if (reason.length < 3) {
    return NextResponse.json(
      { error: "Cancellation reason is required (at least 3 characters)." },
      { status: 400 }
    );
  }

  const mode: RefundMode = body.refundMode ?? "full";

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

    const deposit = order.depositCents;
    let refundCents = 0;

    switch (mode) {
      case "full":
        refundCents = deposit;
        break;
      case "percent": {
        const p = body.percent ?? 0;
        if (p < 1 || p > 100) {
          return NextResponse.json({ error: "Percent must be between 1 and 100." }, { status: 400 });
        }
        refundCents = Math.round((deposit * p) / 100);
        break;
      }
      case "flat": {
        const flat = body.flatCents ?? 0;
        if (flat < 0) {
          return NextResponse.json({ error: "Refund amount cannot be negative." }, { status: 400 });
        }
        refundCents = Math.min(flat, deposit);
        break;
      }
      case "none":
        refundCents = 0;
        break;
      default:
        return NextResponse.json({ error: "Invalid refund mode." }, { status: 400 });
    }

    // Cap refund at deposit (Stripe will reject over-refund anyway)
    refundCents = Math.min(refundCents, deposit);

    let actualRefundCents = 0;
    if (refundCents > 0) {
      try {
        actualRefundCents = await refundDepositViaStripe(order.paymentIntentId, refundCents);
        console.log(`[cancel/operator] Refunded ${actualRefundCents} cents for order ${id}`);
      } catch (stripeErr) {
        console.error("[cancel/operator] Stripe refund failed:", stripeErr);
        const msg =
          stripeErr instanceof Error ? stripeErr.message : "Stripe refund failed";
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    } else {
      console.log(`[cancel/operator] No refund for order ${id} (mode=${mode})`);
    }

    await db.order.update({
      where: { id },
      data: {
        status:             "CANCELLED",
        cancelledAt:        new Date(),
        cancellationReason: reason,
        refundAmountCents:  actualRefundCents,
        cancelledBy:        "operator",
      },
    });

    try {
      await sendCancellationEmail({
        email:             order.couple.email,
        coupleName:        order.couple.name,
        orderId:           order.id,
        refundAmountCents: actualRefundCents,
        cancelledBy:       "operator",
        cancellationReason: reason,
        policyNote:
          mode === "none"
            ? "No refund was processed — the deposit was retained per the selected cancellation option."
            : null,
      });
    } catch (emailErr) {
      console.error("[cancel/operator] Cancellation email failed:", emailErr);
    }

    return NextResponse.json({
      ok:                true,
      refundAmountCents: actualRefundCents,
      message:
        actualRefundCents > 0
          ? `Order cancelled. Refund of $${(actualRefundCents / 100).toFixed(2)} issued.`
          : "Order cancelled. No refund was issued.",
    });
  } catch (err) {
    console.error("[cancel/operator] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
