import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { sendOrderTrackingLinkEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email?: string };

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();

    // Always respond with success to prevent email enumeration.
    // Only actually send the email if the couple exists in our DB.
    const couple = await db.couple.findUnique({ where: { email: normalised } });

    if (couple) {
      const magicToken  = randomBytes(32).toString("hex");
      const tokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await db.couple.update({
        where: { email: normalised },
        data: { magicLinkToken: magicToken, tokenExpiry },
      });

      const magicLinkUrl = `${APP_URL}/my-order?token=${magicToken}`;

      await sendOrderTrackingLinkEmail({
        email:        normalised,
        name:         couple.name,
        magicLinkUrl,
      });
    }
    // If couple not found we still return 200 — couple just won't get an email.

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[request-magic-link] Error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
