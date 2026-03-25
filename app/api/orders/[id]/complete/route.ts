import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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
      data: { status: "COMPLETE" },
      select: { id: true, status: true },
    });
    return NextResponse.json({ success: true, status: order.status });
  } catch (err) {
    console.error("Mark complete error:", err);
    return NextResponse.json({ error: "Could not update order" }, { status: 500 });
  }
}
