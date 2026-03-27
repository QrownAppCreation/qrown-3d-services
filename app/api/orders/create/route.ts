import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import type { OrderDraft, AddOnKey } from "@/lib/order-store";
import { AddOnType, StyleTier } from "@prisma/client";
import type Stripe from "stripe";
import { Resend } from "resend";

const OPERATOR_EMAIL = "quin3030@hotmail.com";
const APP_URL        = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Authoritative server-side price table (cents) covering every AddOnType.
 * These are used as defaults when the client doesn't send a price.
 */
const ADDON_PRICE_LOOKUP: Record<AddOnType, number> = {
  HAND_PAINTING: 6500,
  GIFT_BOX:      1200,
  ENGRAVED_BASE: 1200,
  RUSH_ORDER:    0,   // percentage surcharge — calculated from order total below
  STL_LICENSE:   3500,
  REORDER_FEE:   2900,
  TRAVEL_FEE:    0,   // quoted case-by-case
  RESIN_COAT:    4500,
};

/** Resolve the price for a single add-on row. */
function resolveAddonPrice(
  type: AddOnType,
  orderTotalCents: number,
  qty: number
): number {
  if (type === "RUSH_ORDER") {
    // 50% surcharge of the pre-rush subtotal
    return Math.round(orderTotalCents * 0.5);
  }
  const unitPrice = ADDON_PRICE_LOOKUP[type] ?? 0;
  return unitPrice * qty;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, draft } = body as {
      email: string;
      name: string;
      draft: OrderDraft;
    };

    // ── Validate required top-level fields ───────────────────────────────────
    if (!email || !name || !draft) {
      return NextResponse.json(
        { error: "Missing required fields: email, name, draft" },
        { status: 400 }
      );
    }

    // ── Pricing ──────────────────────────────────────────────────────────────
    const qty             = Math.max(1, draft.quantity ?? 1);
    const basePriceCents  = 7900; // $79 per cake topper
    const subtotalCents   = basePriceCents * qty;

    // Add-ons total (excluding rush, which is a surcharge)
    let addOnSubtotal = 0;
    if (draft.addOns) {
      for (const [key, selected] of Object.entries(draft.addOns)) {
        if (!selected || key === "RUSH_ORDER") continue;
        const unitPrice = ADDON_PRICE_LOOKUP[key as AddOnType] ?? 0;
        addOnSubtotal += unitPrice * qty;
      }
    }

    const preRushTotal    = subtotalCents + addOnSubtotal;
    const rushSurcharge   = draft.addOns?.RUSH_ORDER
      ? Math.round(preRushTotal * 0.5)
      : 0;

    // Prefer client-calculated total (already includes rush) but fall back to server calc
    const totalCents   = draft.totalCents ?? (preRushTotal + rushSurcharge);
    const depositCents = draft.depositCents ?? Math.round(totalCents * 0.5);
    const balanceCents = totalCents - depositCents;

    // ── Build add-on rows ─────────────────────────────────────────────────────
    const addOnInputs: { type: AddOnType; priceCents: number; quantity: number }[] = [];

    if (draft.addOns) {
      for (const [key, selected] of Object.entries(draft.addOns)) {
        if (!selected) continue;

        const addonType  = key as AddOnType;
        const addonPrice = resolveAddonPrice(addonType, preRushTotal, qty);

        addOnInputs.push({
          type:       addonType,
          priceCents: addonPrice,   // always a non-NaN integer
          quantity:   qty,
        });
      }
    }

    // ── Magic link token (generated once, stored on the Couple record) ────────
    const magicToken  = randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const magicLinkUrl = `${APP_URL}/my-order?token=${magicToken}`;

    // ── Atomic database transaction ──────────────────────────────────────────
    const order = await db.$transaction(async (tx) => {
      // Upsert couple — always refresh the magic token so the email link is current
      const couple = await tx.couple.upsert({
        where:  { email },
        update: { name, magicLinkToken: magicToken, tokenExpiry },
        create: { email, name, magicLinkToken: magicToken, tokenExpiry },
      });

      // Create the order record
      const newOrder = await tx.order.create({
        data: {
          coupleId:     couple.id,
          status:       "PENDING_PAYMENT",
          depositCents,
          balanceCents,
          styleTier:    (draft.styleTier as StyleTier) ?? "ELEGANT",
          weddingDate:  draft.weddingDate ? new Date(draft.weddingDate) : null,
          colorPalette: draft.colorPalette ?? null,
          styleNotes:   draft.styleNotes   ?? null,
        },
      });

      // Create the design record (MVP: always a cake topper)
      await tx.design.create({
        data: {
          orderId:          newOrder.id,
          category:         "CAKE_TOPPER",
          quantity:         qty,
          generationMethod: "AI_PHOTO",
          status:           "QUEUED",
          photoUrls:        draft.photoUrls   ?? {},
          partner1Name:     draft.partner1Name ?? null,
          partner2Name:     draft.partner2Name ?? null,
        },
      });

      // Create add-on rows (only if any were selected)
      if (addOnInputs.length > 0) {
        await tx.addOn.createMany({
          data: addOnInputs.map((a) => ({
            orderId:    newOrder.id,
            type:       a.type,
            priceCents: a.priceCents,   // explicit — no spread risk
            quantity:   a.quantity,
          })),
        });
      }

      return newOrder;
    });

    // ── Stripe Checkout Session ──────────────────────────────────────────────
    // Build one line item per product + one per add-on so the Stripe receipt
    // shows a clear itemised breakdown.
    const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency:     "usd",
          product_data: {
            name: `${draft.styleTier ?? "Elegant"} Cake Topper ×${qty} — 50% deposit`,
          },
          unit_amount: Math.round(subtotalCents * 0.5),
        },
        quantity: 1,
      },
    ];

    // Add-on deposit line items
    for (const a of addOnInputs) {
      if (a.priceCents === 0) continue; // skip zero-price rows (TRAVEL_FEE, etc.)
      stripeLineItems.push({
        price_data: {
          currency:     "usd",
          product_data: { name: `${a.type.replace(/_/g, " ")} — 50% deposit` },
          unit_amount:  Math.round(a.priceCents * 0.5),
        },
        quantity: 1,
      });
    }

    const stripeSession = await getStripe().checkout.sessions.create({
      mode:           "payment",
      customer_email: email,
      line_items:     stripeLineItems,
      metadata:       { orderId: order.id },
      success_url:    `${APP_URL}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:     `${APP_URL}/order/step5-payment`,
    });

    // ── Emails (fire immediately — does not require Stripe webhook) ──────────
    // FROM_EMAIL must be a verified Resend sender in production.
    // Set FROM_EMAIL=hello@wedprint3d.com in Vercel env vars after domain verification.
    // In development "onboarding@resend.dev" works without domain verification.
    const resend    = new Resend(process.env.RESEND_API_KEY);
    const FROM_ADDR = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
    const shortId = order.id.slice(-8).toUpperCase();
    const fmt = (c: number) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(c / 100);

    // 1. Customer confirmation
    console.log(`[orders/create] Sending confirmation email to ${email} …`);
    try {
      const customerResult = await resend.emails.send({
        from:    FROM_ADDR,
        to:      email,
        subject: "Your WedPrint order is confirmed!",
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#FAFAF7;">
            <div style="background:#2d2d2a;padding:28px;text-align:center;">
              <h1 style="color:#C9A84C;margin:0;font-size:26px;letter-spacing:2px;">WedPrint</h1>
            </div>
            <div style="padding:36px;">
              <h2 style="color:#2d2d2a;margin-top:0;">Order Confirmed! 🎉</h2>
              <p style="color:#555;line-height:1.7;">
                Hi <strong>${name}</strong>, thank you for your WedPrint order.
                We're excited to start creating something beautiful for your big day.
              </p>
              <div style="background:#fff;border:1px solid #e5e5e0;border-radius:10px;padding:20px;margin:20px 0;">
                <p style="margin:0 0 8px;color:#888;font-size:13px;">Order reference</p>
                <p style="margin:0 0 16px;font-size:18px;font-weight:bold;color:#2d2d2a;">#${shortId}</p>
                <div style="border-top:1px solid #f0f0ea;padding-top:12px;">
                  <p style="margin:4px 0;font-size:14px;color:#555;">Deposit paid: <strong style="color:#8FAF8F;">${fmt(depositCents)}</strong></p>
                  <p style="margin:4px 0;font-size:14px;color:#555;">Balance due upon design approval: <strong>${fmt(balanceCents)}</strong></p>
                </div>
              </div>
              <p style="color:#555;line-height:1.7;">
                Your 50% deposit has been received. The remaining balance of <strong>${fmt(balanceCents)}</strong>
                will be collected once you approve your design preview.
                We will send your design preview within 48 hours.
              </p>
              <div style="text-align:center;margin:28px 0;">
                <a href="${magicLinkUrl}" style="
                  display:inline-block;background:#8FAF8F;color:white;
                  padding:14px 32px;border-radius:8px;text-decoration:none;
                  font-weight:600;font-size:15px;
                ">View your order status →</a>
                <p style="color:#888;font-size:12px;margin-top:10px;">
                  This link is valid for 30 days. Bookmark it to track your order anytime.
                </p>
              </div>
              <p style="color:#888;font-size:13px;border-top:1px solid #e5e5e0;padding-top:20px;">
                Questions? Reply to this email and we'll get back to you right away. 💛<br/>
                — The WedPrint Team
              </p>
            </div>
          </div>
        `,
      });
      console.log("[orders/create] Customer email result:", JSON.stringify(customerResult));
    } catch (emailErr) {
      console.error("[orders/create] Customer email FAILED:", emailErr);
    }

    // 2. Operator alert
    console.log(`[orders/create] Sending operator alert to ${OPERATOR_EMAIL} …`);
    try {
      const operatorResult = await resend.emails.send({
        from:    FROM_ADDR,
        to:      OPERATOR_EMAIL,
        subject: "New WedPrint order received",
        html: `
          <h2 style="font-family:sans-serif;">New Order — #${shortId}</h2>
          <p style="font-family:sans-serif;">
            <strong>Couple:</strong> ${name}<br/>
            <strong>Email:</strong> ${email}<br/>
            <strong>Style tier:</strong> ${draft.styleTier ?? "ELEGANT"}<br/>
            <strong>Quantity:</strong> ${qty}<br/>
            <strong>Deposit:</strong> ${fmt(depositCents)}<br/>
            <strong>Balance:</strong> ${fmt(balanceCents)}<br/>
            <strong>Wedding date:</strong> ${draft.weddingDate ?? "not provided"}<br/>
            <strong>Add-ons:</strong> ${addOnInputs.length > 0
              ? addOnInputs.map((a) => `${a.type} (${fmt(a.priceCents)})`).join(", ")
              : "none"
            }
          </p>
          <p style="font-family:sans-serif;">
            <a href="${APP_URL}/operator/orders/${order.id}">View order in dashboard →</a>
          </p>
        `,
      });
      console.log("[orders/create] Operator email result:", JSON.stringify(operatorResult));
    } catch (emailErr) {
      console.error("[orders/create] Operator email FAILED:", emailErr);
    }

    // ── Response ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      checkoutUrl: stripeSession.url,
      orderId:     order.id,
      // Debug summary — visible in browser devtools during development
      _debug: {
        qty,
        subtotalCents,
        addOnSubtotal,
        rushSurcharge,
        totalCents,
        depositCents,
        balanceCents,
        addOns: addOnInputs,
      },
    });
  } catch (err) {
    // Log the real Prisma / Stripe error for debugging
    console.error("[orders/create] Error:", err);
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Could not create order", detail: message },
      { status: 500 }
    );
  }
}
