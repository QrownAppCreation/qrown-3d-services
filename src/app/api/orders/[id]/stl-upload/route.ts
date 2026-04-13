import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("fileName");

    if (!fileName) {
      return NextResponse.json({ error: "fileName required" }, { status: 400 });
    }

    const path = `${id}/${Date.now()}-${fileName}`;
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { path } = await req.json();

    if (!path) {
      return NextResponse.json({ error: "path required" }, { status: 400 });
    }

    await db.order.update({
      where: { id },
      data: { stlFileUrl: path },
    });

    return NextResponse.json({ success: true, path });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}