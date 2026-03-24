import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendDesignReadyEmail, sendApprovalConfirmationEmail, sendOperatorNotification } from "@/lib/email";
import { randomBytes } from "crypto";
import { addDays, format } from "date-fns";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: designId } = await params;
    const body = await req.json();
    const { action, token } = body;

    const design = await db.design.findUnique({
      where: { id: designId },
      include: {
        order: {
          include: { couple: true },
        },
      },
    });

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    // ── OPERATOR: Send approval email to couple ──────────────────────────────
    if (action === "send_approval") {
      const approvalToken = randomBytes(32).toString("hex");
      const tokenExpiry = addDays(new Date(), 7);
      const deadline = format(tokenExpiry, "MMMM d, yyyy");

      await db.design.update({
        where: { id: designId },
        data: {
          approvalToken,
          tokenExpiry,
          status: "CLIENT_SENT",
        },
      });

      const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const approvalUrl = `${APP_URL}/approval/${approvalToken}`;

      await sendDesignReadyEmail({
        email: design.order.couple.email,
        coupleName: design.order.couple.name,
        previewImageUrl: design.previewImageUrl ?? "",
        approvalUrl,
        deadline,
      });

      // Update order status
      await db.order.update({
        where: { id: design.orderId },
        data: { status: "AWAITING_APPROVAL" },
      });

      return NextResponse.json({ success: true });
    }

    // ── CLIENT: Approve the design via token ─────────────────────────────────
    if (action === "approve") {
      if (!token) {
        return NextResponse.json({ error: "Missing token" }, { status: 400 });
      }

      if (design.approvalToken !== token) {
        return NextResponse.json({ error: "Invalid token" }, { status: 403 });
      }

      if (design.tokenExpiry && design.tokenExpiry < new Date()) {
        return NextResponse.json({ error: "Token expired" }, { status: 403 });
      }

      await db.design.update({
        where: { id: designId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
        },
      });

      await db.order.update({
        where: { id: design.orderId },
        data: { status: "APPROVED" },
      });

      await sendApprovalConfirmationEmail({
        email: design.order.couple.email,
        coupleName: design.order.couple.name,
        orderId: design.orderId,
      });

      await sendOperatorNotification(
        `Design approved by ${design.order.couple.name}!`,
        design.orderId
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Design approve error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
