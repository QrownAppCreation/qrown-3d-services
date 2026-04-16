import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "operator") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  let body: { action?: string };
  try {
    body = (await req.json()) as { action?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action;
  console.log("[reviews/moderate]", id, action);

  if (action === "approve") {
    try {
      await db.review.update({
        where: { id },
        data: { approved: true },
      });
    } catch {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, approved: true });
  }

  if (action === "reject") {
    try {
      await db.review.delete({ where: { id } });
    } catch {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted: true });
  }

  return NextResponse.json(
    { error: "action must be 'approve' or 'reject'" },
    { status: 400 }
  );
}
