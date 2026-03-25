/**
 * ONE-TIME setup route — creates or resets the operator account.
 * Call it once via browser or curl, then it's safe to leave in place
 * (it requires a secret token so it can't be abused).
 *
 * Usage:
 *   GET http://localhost:3000/api/setup/operator?secret=WedPrint2026
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashSync } from "bcryptjs";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  // Guard: must pass the setup secret to prevent accidental resets
  const expectedSecret = process.env.OPERATOR_SEED_PASSWORD ?? "WedPrint2026";
  if (secret !== expectedSecret) {
    return NextResponse.json(
      { error: "Missing or wrong ?secret= query parameter" },
      { status: 401 }
    );
  }

  const email    = process.env.OPERATOR_EMAIL ?? "quincy_c_brown@hotmail.com";
  const password = process.env.OPERATOR_SEED_PASSWORD ?? "WedPrint2026";

  try {
    const passwordHash = hashSync(password, 12);

    const operator = await db.user.upsert({
      where:  { email },
      update: { passwordHash, role: "operator", name: "WedPrint Operator" },
      create: {
        email,
        name:         "WedPrint Operator",
        role:         "operator",
        passwordHash,
      },
    });

    console.log(`[setup/operator] Operator upserted: ${operator.email}`);

    return NextResponse.json({
      ok:      true,
      message: "Operator account ready.",
      email:   operator.email,
      role:    operator.role,
      // Never return the password or hash in production — fine here as dev-only tool
      hint:    `Login at /operator/login with this email and the password you provided as ?secret=`,
    });
  } catch (err) {
    console.error("[setup/operator] Error:", err);
    return NextResponse.json(
      { error: "Failed to create operator", detail: String(err) },
      { status: 500 }
    );
  }
}
