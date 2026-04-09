import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendOrderCompleteEmail, sendOperatorNotification } from "@/lib/email";
import { formatUsdCents } from "@/lib/format-currency";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: Context) {
  const session = await auth();
  if (!session || session.user.role !== "operator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const order = await db.order.update({
      where: { id },
      data:  { status: "COMPLETE" },
      include: { couple: true },
    });

    // Send completion email to the couple
    try {
      await sendOrderCompleteEmail({
        email:      order.couple.email,
        coupleName: order.couple.name,
        balanceDue: formatUsdCents(order.balanceCents),
      });

      await sendOperatorNotification(
        `Order #${id.slice(-8).toUpperCase()} marked COMPLETE — ${order.couple.name}`,
        id
      );
    } catch (emailErr) {
      // Email failure should not block the status update
      console.error("[complete] Email error:", emailErr);
    }

    return NextResponse.json({ success: true, status: order.status });
  } catch (err) {
    console.error("Mark complete error:", err);
    return NextResponse.json({ error: "Could not update order" }, { status: 500 });
  }
}
