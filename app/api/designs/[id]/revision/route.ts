import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOperatorNotification } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: designId } = await params;
    const body = await req.json();
    const { token, clientNotes } = body;

    if (!token || !clientNotes) {
      return NextResponse.json(
        { error: "Missing token or notes" },
        { status: 400 }
      );
    }

    const design = await db.design.findUnique({
      where: { id: designId },
      include: {
        order: { include: { couple: true } },
      },
    });

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    if (design.approvalToken !== token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    if (design.tokenExpiry && design.tokenExpiry < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 403 });
    }

    const newRevisionRound = design.revisionRound + 1;

    await db.design.update({
      where: { id: designId },
      data: {
        status: "REVIEW",
        revisionRound: newRevisionRound,
        clientNotes,
        approvalToken: null,
        tokenExpiry: null,
      },
    });

    await db.order.update({
      where: { id: design.orderId },
      data: { status: "IN_DESIGN" },
    });

    await sendOperatorNotification(
      `Revision request from ${design.order.couple.name} (Round ${newRevisionRound}): "${clientNotes.slice(0, 100)}..."`,
      design.orderId
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Revision error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
