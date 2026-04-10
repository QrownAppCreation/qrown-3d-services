import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Step 1: Get a signed upload URL
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("fileName");

    if (!fileName) {
      return NextResponse.json({ error: "fileName required" }, { status: 400 });
    }

    const path = `${params.id}/${Date.now()}-${fileName}`;

    const { data, error } = await supabase.storage
      .from("stl-files")
      .createSignedUploadUrl(path);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl, path });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Step 2: Save the path to design + order after direct upload
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { path, orderId } = await req.json();

    if (!path) {
      return NextResponse.json({ error: "path required" }, { status: 400 });
    }

    // Update the design's stlUrl
    await prisma.design.update({
      where: { id: params.id },
      data: { stlUrl: path, status: "REVIEW" },
    });

    // Also update the order's stlFileUrl if orderId provided
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { stlFileUrl: path },
      });
    }

    return NextResponse.json({ success: true, path });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}