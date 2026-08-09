import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import {
  ADDON_PRICES,
  calculateTotal,
  formatCents,
  type AddOnKey,
  type OrderDraft,
} from "@/lib/order-pricing";
import { AddOnType, StyleTier } from "@prisma/client";
import type Stripe from "stripe";
import { Resend } from "resend";
import { notEdibleDisclaimerEmailHtml } from "@/lib/disclaimer";
// PHASE 2 — partner referral attribution.
import { resolvePartnerIdFromRef, commissionCents } from "@/lib/partner";
import { sendPartnerNewOrderEmail } from "@/lib/partner-email";

const OPERATOR_EMAIL = process.env.OPERATOR_EMAIL ?? "hello@wedprint3d.com";
const APP_URL        = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Same add-on prices as the wizard (`order-pricing.ts`). Rush is a % of pre-rush subtotal. */
function resolveAddonPrice(
  type: AddOnType,
  preRushSubtotal: number,
  qty: number
): number {
  if (type === "RUSH_ORDER") {
    return Math.round(preRushSubtotal * 0.5);
  }
  if (Object.prototype.hasOwnProperty.call(ADDON_PRICES, type)) {
    return ADDON_PRICES[type as AddOnKey] * qty;
  }
  return 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, draft, partnerRef } = body as {
      email: string;
      name: string;
      draft: OrderDraft;
      /** PHASE 2 — partner slug from ?ref=, optional. */
      partnerRef?: string | null;
    };

    // ── Validate required top-level fields ───────────────────────────────────
    if (!email || !name || !draft) {
      return NextResponse.json(
        { error: "Missing required fields: email, name, draft" },
        { status: 400 }
      );
    }

    // ── Pricing (must match wizard `calculateTotal` — Stripe + DB match) ─────
    const qty             = Math.max(1, draft.quantity ?? 1);
    const pricing         = calculateTotal(draft);
    const totalCents      = pricing.total;
    const depositCents    = pricing.deposit;
    const balanceCents    = pricing.balance;
    const subtotalCents   = pricing.subtotal;
    const rushSurcharge   = pricing.rushSurcharge;
    const preRushTotal    = subtotalCents;

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

    // ── PHASE 2: resolve referral slug → partner id ──────────────────────────
    // Returns null for unknown/inactive slugs so a bad ?ref= never blocks an order.
    const partnerId = await resolvePartnerIdFromRef(partnerRef);

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
          colorTier:    (draft.colorTier as "CLASSIC" | "DUO" | "SIGNATURE" | "HEIRLOOM") ?? "CLASSIC",
          weddingDate:  draft.weddingDate ? new Date(draft.weddingDate) : null,
          colorPalette: draft.colorPalette ?? null,
          styleNotes:   draft.styleNotes   ?? null,
          partnerId,    // PHASE 2 — null for direct orders
        },
      });

      // PHASE 2 — record the referred customer against the partner.
      // Upsert keeps one row per (partner, email) across repeat orders.
      if (partnerId) {
        await tx.partnerCustomer.upsert({
          where: { partnerId_email: { partnerId, email } },
          // Never overwrite firstOrderAt — it marks the original conversion.
          update: { name },
          create: {
            partnerId,
            email,
            name,
            source: "referral_link",
            firstOrderAt: new Date(),
          },
        });
      }

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
    // One line item for the exact deposit (cents) so the charge always matches `depositCents`.
    const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${draft.styleTier ?? "Elegant"} order — 50% deposit`,
            description: `Order total ${formatCents(totalCents)} · Balance ${formatCents(balanceCents)} due at design approval`,
          },
          unit_amount: depositCents,
        },
        quantity: 1,
      },
    ];

    const stripeSession = await getStripe().checkout.sessions.create({
      mode:           "payment",
      customer_email: email,
      line_items:     stripeLineItems,
      metadata:       { orderId: order.id, type: "deposit" },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          type:    "deposit",
        },
      },
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
    const fmt = formatCents;

    // Build display strings for the email
    const greeting = (draft.partner1Name && draft.partner2Name)
      ? `${draft.partner1Name} & ${draft.partner2Name}`
      : name;
    const weddingDateDisplay = draft.weddingDate
      ? new Date(draft.weddingDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
      : "Not specified";
    const colorTierDisplay = draft.colorTier ?? "CLASSIC";
    const orderDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    // 1. Customer confirmation
    console.log(`[orders/create] Sending confirmation email to ${email} …`);
    try {
      const customerResult = await resend.emails.send({
        from:    FROM_ADDR,
        to:      email,
        subject: "Your WedPrint order is confirmed! 🎉",
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FAFAF7;">
            <div style="background:#2d2d2a;padding:32px;text-align:center;">
              <h1 style="color:#C9A84C;margin:0;font-size:28px;letter-spacing:2px;">WedPrint</h1>
              <p style="color:#fff;margin:8px 0 0;font-size:13px;letter-spacing:1px;">Handcrafted 3D Keepsakes</p>
            </div>
            <div style="padding:40px 36px;">
              <h2 style="color:#2d2d2a;margin-top:0;">Your order is confirmed! 🎉</h2>
              <p style="color:#555;line-height:1.7;">
                Hi <strong>${greeting}</strong>, thank you so much for placing your order with WedPrint.
                We are absolutely thrilled to be a small part of your big day.
              </p>

              <div style="background:#fff;border:1px solid #e5e5e0;border-radius:10px;padding:24px;margin:28px 0;">
                <h3 style="color:#2d2d2a;margin-top:0;font-size:16px;">Order Summary</h3>
                <p style="color:#888;font-size:13px;margin:0 0 16px;">
                  Reference: <strong style="color:#2d2d2a;">#${shortId}</strong>
                  &nbsp;·&nbsp; Placed: ${orderDate}
                </p>

                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                  <tr style="border-bottom:1px solid #f0f0ea;">
                    <td style="padding:6px 0;color:#888;">Couple</td>
                    <td style="padding:6px 0;color:#2d2d2a;font-weight:600;text-align:right;">${greeting}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #f0f0ea;">
                    <td style="padding:6px 0;color:#888;">Wedding date</td>
                    <td style="padding:6px 0;color:#2d2d2a;text-align:right;">${weddingDateDisplay}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #f0f0ea;">
                    <td style="padding:6px 0;color:#888;">Color tier</td>
                    <td style="padding:6px 0;color:#2d2d2a;text-align:right;">${colorTierDisplay}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #f0f0ea;">
                    <td style="padding:6px 0;color:#888;">Quantity</td>
                    <td style="padding:6px 0;color:#2d2d2a;text-align:right;">${qty}</td>
                  </tr>
                  <tr style="border-bottom:2px solid #e5e5e0;">
                    <td style="padding:10px 0 6px;color:#555;">Deposit paid today</td>
                    <td style="padding:10px 0 6px;color:#8FAF8F;font-weight:700;text-align:right;">${fmt(depositCents)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#555;">Balance due upon design approval</td>
                    <td style="padding:6px 0;color:#2d2d2a;font-weight:600;text-align:right;">${fmt(balanceCents)}</td>
                  </tr>
                </table>
              </div>

              <div style="background:#f0f4f0;border-radius:8px;padding:16px;font-size:14px;color:#444;line-height:1.6;">
                Your 50% deposit has been received. The remaining balance of <strong>${fmt(balanceCents)}</strong>
                will be collected once you approve your design preview. We will send your design preview within 48 hours.
              </div>

              ${notEdibleDisclaimerEmailHtml()}

              <div style="text-align:center;margin:32px 0;">
                <a href="${magicLinkUrl}" style="
                  display:inline-block;background:#8FAF8F;color:white;
                  padding:14px 32px;border-radius:8px;text-decoration:none;
                  font-weight:600;font-size:15px;font-family:sans-serif;
                ">View your order status →</a>
                <p style="color:#888;font-size:12px;margin-top:10px;font-family:sans-serif;">
                  This link is valid for 30 days. Bookmark it to track your order anytime.
                </p>
              </div>

              <p style="color:#888;font-size:13px;line-height:1.7;border-top:1px solid #e5e5e0;padding-top:24px;margin-top:32px;">
                Questions? Reply to this email and we'll get back to you right away. 💛<br/><br/>
                With love,<br/>
                <strong style="color:#2d2d2a;">The WedPrint Team</strong>
              </p>
            </div>
            <div style="background:#2d2d2a;padding:20px;text-align:center;">
              <p style="color:#666;font-size:12px;margin:0;">© ${new Date().getFullYear()} WedPrint · Made with love</p>
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
        subject: `[WedPrint] New order #${shortId} — ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#FAFAF7;">
            <div style="background:#2d2d2a;padding:24px;text-align:center;">
              <h1 style="color:#C9A84C;margin:0;font-size:22px;letter-spacing:2px;">WedPrint Operator</h1>
            </div>
            <div style="padding:32px;">
              <h2 style="color:#2d2d2a;margin-top:0;">New order received 🎉</h2>

              <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
                <tr style="border-bottom:1px solid #e5e5e0;">
                  <td style="padding:8px 0;color:#888;width:40%;">Order number</td>
                  <td style="padding:8px 0;color:#2d2d2a;font-weight:700;">#${shortId}</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e5e0;">
                  <td style="padding:8px 0;color:#888;">Order date</td>
                  <td style="padding:8px 0;color:#2d2d2a;">${orderDate}</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e5e0;">
                  <td style="padding:8px 0;color:#888;">Couple</td>
                  <td style="padding:8px 0;color:#2d2d2a;font-weight:600;">${greeting}</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e5e0;">
                  <td style="padding:8px 0;color:#888;">Customer email</td>
                  <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#8FAF8F;">${email}</a></td>
                </tr>
                <tr style="border-bottom:1px solid #e5e5e0;">
                  <td style="padding:8px 0;color:#888;">Wedding date</td>
                  <td style="padding:8px 0;color:#2d2d2a;">${weddingDateDisplay}</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e5e0;">
                  <td style="padding:8px 0;color:#888;">Color tier</td>
                  <td style="padding:8px 0;color:#2d2d2a;font-weight:600;">${colorTierDisplay}</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e5e0;">
                  <td style="padding:8px 0;color:#888;">Style tier</td>
                  <td style="padding:8px 0;color:#2d2d2a;">${draft.styleTier ?? "ELEGANT"}</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e5e0;">
                  <td style="padding:8px 0;color:#888;">Quantity</td>
                  <td style="padding:8px 0;color:#2d2d2a;">${qty}</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e5e0;">
                  <td style="padding:8px 0;color:#888;">Add-ons</td>
                  <td style="padding:8px 0;color:#2d2d2a;">${addOnInputs.length > 0
                    ? addOnInputs.map((a) => `${a.type.replace(/_/g, " ")} (${fmt(a.priceCents)})`).join(", ")
                    : "None"
                  }</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e5e0;">
                  <td style="padding:8px 0;color:#888;">Deposit paid</td>
                  <td style="padding:8px 0;color:#2d2d2a;font-weight:700;">${fmt(depositCents)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#888;">Balance due</td>
                  <td style="padding:8px 0;color:#2d2d2a;">${fmt(balanceCents)}</td>
                </tr>
              </table>

              <div style="text-align:center;margin-top:24px;">
                <a href="${APP_URL}/operator/orders/${order.id}" style="
                  display:inline-block;background:#2d2d2a;color:white;
                  padding:12px 28px;border-radius:8px;text-decoration:none;
                  font-weight:600;font-size:14px;
                ">View order in dashboard →</a>
              </div>
            </div>
          </div>
        `,
      });
      console.log("[orders/create] Operator email result:", JSON.stringify(operatorResult));
    } catch (emailErr) {
      console.error("[orders/create] Operator email FAILED:", emailErr);
    }

    // 3. PHASE 2 — notify the referring partner (best effort, never blocks)
    if (partnerId) {
      try {
        const partner = await db.partner.findUnique({
          where: { id: partnerId },
          select: { email: true, contactName: true, commissionBps: true },
        });

        if (partner) {
          await sendPartnerNewOrderEmail({
            email:       partner.email,
            contactName: partner.contactName,
            orderId:     order.id,
            orderTotalCents: totalCents,
            // "Estimated" — it is only credited when the order hits COMPLETE.
            estimatedCommissionCents: commissionCents(
              totalCents,
              partner.commissionBps
            ),
          });
        }
      } catch (partnerErr) {
        console.error("[orders/create] Partner notification FAILED:", partnerErr);
      }
    }

    // ── Response ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      checkoutUrl: stripeSession.url,
      orderId:     order.id,
      // Debug summary — visible in browser devtools during development
      _debug: {
        qty,
        subtotalCents,
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
