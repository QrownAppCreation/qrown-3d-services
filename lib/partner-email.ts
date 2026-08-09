/**
 * Partner lifecycle emails (Phase 2).
 *
 * Kept separate from lib/email.ts so partner comms can be versioned and
 * A/B tested without touching the couple-facing order emails.
 *
 * Every function here is fire-and-forget: callers wrap in try/catch so an
 * email outage never blocks an approval or an order.
 */

import { Resend } from "resend";
import { formatUsdCents } from "@/lib/format-currency";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set in your .env file.");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
const OPERATOR_EMAIL = process.env.OPERATOR_EMAIL ?? "hello@wedprint3d.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Shared brand chrome so every partner email looks identical. */
function shell(title: string, body: string): string {
  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FAFAF7;">
      <div style="background:#2C2C2A;padding:32px;text-align:center;">
        <h1 style="color:#C9A84C;margin:0;font-size:26px;letter-spacing:2px;">WedPrint</h1>
        <p style="color:#fff;margin:8px 0 0;font-size:12px;letter-spacing:1px;">Partner Program</p>
      </div>
      <div style="padding:36px 32px;">
        <h2 style="color:#2C2C2A;margin-top:0;font-size:21px;">${title}</h2>
        ${body}
      </div>
      <div style="background:#2C2C2A;padding:18px;text-align:center;">
        <p style="color:#888;font-size:12px;margin:0;">© ${new Date().getFullYear()} WedPrint3D · Miami, FL</p>
      </div>
    </div>
  `;
}

/** Burnt-orange CTA button matching --wp-cta. */
function cta(href: string, label: string): string {
  return `
    <div style="text-align:center;margin:28px 0;">
      <a href="${href}" style="display:inline-block;background:#C4622D;color:#fff;padding:14px 30px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;font-family:sans-serif;">${label}</a>
    </div>
  `;
}

/** Sent to the applicant the moment they submit /partner/apply. */
export async function sendPartnerApplicationReceived(params: {
  email: string;
  contactName: string;
  businessName: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: params.email,
    subject: "We received your WedPrint partner application",
    html: shell(
      "Thanks for applying 🤍",
      `
        <p style="color:#555;line-height:1.7;">
          Hi <strong>${params.contactName}</strong>, we've received the partner application
          for <strong>${params.businessName}</strong>.
        </p>
        <p style="color:#555;line-height:1.7;">
          We review every application by hand — usually within two business days.
          Once you're approved we'll send your referral link and dashboard access,
          and you'll start earning commission on every couple you send our way.
        </p>
        <p style="color:#888;font-size:13px;line-height:1.7;border-top:1px solid #E8E5DF;padding-top:20px;margin-top:28px;">
          Questions in the meantime? Just reply to this email.<br/><br/>
          — The WedPrint Team
        </p>
      `
    ),
  });
}

/** Sent to the operator so a new application doesn't sit unnoticed. */
export async function sendPartnerApplicationAlert(params: {
  businessName: string;
  contactName: string;
  email: string;
  website?: string | null;
  referralSource?: string | null;
}) {
  await getResend().emails.send({
    from: FROM,
    to: OPERATOR_EMAIL,
    subject: `[WedPrint] New partner application — ${params.businessName}`,
    html: shell(
      "New partner application",
      `
        <table style="width:100%;border-collapse:collapse;font-size:14px;font-family:sans-serif;">
          <tr style="border-bottom:1px solid #E8E5DF;"><td style="padding:8px 0;color:#888;width:38%;">Business</td><td style="padding:8px 0;color:#2C2C2A;font-weight:700;">${params.businessName}</td></tr>
          <tr style="border-bottom:1px solid #E8E5DF;"><td style="padding:8px 0;color:#888;">Contact</td><td style="padding:8px 0;color:#2C2C2A;">${params.contactName}</td></tr>
          <tr style="border-bottom:1px solid #E8E5DF;"><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;"><a href="mailto:${params.email}" style="color:#8B9D77;">${params.email}</a></td></tr>
          <tr style="border-bottom:1px solid #E8E5DF;"><td style="padding:8px 0;color:#888;">Website</td><td style="padding:8px 0;color:#2C2C2A;">${params.website || "—"}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Heard about us</td><td style="padding:8px 0;color:#2C2C2A;">${params.referralSource || "—"}</td></tr>
        </table>
        ${cta(`${APP_URL}/operator/dashboard#partners`, "Review in dashboard →")}
      `
    ),
  });
}

/** Sent on approval — carries the referral link, which is the whole product. */
export async function sendPartnerApprovedEmail(params: {
  email: string;
  contactName: string;
  businessName: string;
  slug: string;
  commissionBps: number;
}) {
  const referralUrl = `${APP_URL}/?ref=${params.slug}`;
  const ratePct = (params.commissionBps / 100).toFixed(0);

  await getResend().emails.send({
    from: FROM,
    to: params.email,
    subject: "You're approved — welcome to the WedPrint Partner Program 🎉",
    html: shell(
      "You're in 🎉",
      `
        <p style="color:#555;line-height:1.7;">
          Hi <strong>${params.contactName}</strong>, <strong>${params.businessName}</strong> is
          now an approved WedPrint partner. Here's everything you need.
        </p>

        <div style="background:#fff;border:1px solid #E8E5DF;border-radius:10px;padding:22px;margin:24px 0;">
          <p style="color:#888;font-size:12px;margin:0 0 6px;letter-spacing:1px;font-family:sans-serif;">YOUR REFERRAL LINK</p>
          <p style="margin:0 0 18px;"><a href="${referralUrl}" style="color:#C4622D;font-weight:600;font-size:15px;word-break:break-all;font-family:sans-serif;">${referralUrl}</a></p>
          <p style="color:#888;font-size:12px;margin:0 0 6px;letter-spacing:1px;font-family:sans-serif;">YOUR COMMISSION</p>
          <p style="margin:0;color:#2C2C2A;font-weight:700;font-size:20px;font-family:sans-serif;">${ratePct}% of every order</p>
        </div>

        <p style="color:#555;line-height:1.7;">
          Share that link with your couples. Anyone who orders through it is
          automatically credited to you, and your commission lands in your
          balance as soon as their order is complete.
        </p>

        ${cta(`${APP_URL}/partner/dashboard`, "Open your dashboard →")}

        <p style="color:#888;font-size:13px;line-height:1.7;border-top:1px solid #E8E5DF;padding-top:20px;">
          Log in with this email address — we'll send you a one-time sign-in link.<br/><br/>
          — The WedPrint Team
        </p>
      `
    ),
  });
}

/** Sent when a referred couple places an order. */
export async function sendPartnerNewOrderEmail(params: {
  email: string;
  contactName: string;
  orderId: string;
  orderTotalCents: number;
  estimatedCommissionCents: number;
}) {
  const shortId = params.orderId.slice(-8).toUpperCase();

  await getResend().emails.send({
    from: FROM,
    to: params.email,
    subject: `New order through your referral link — #${shortId}`,
    html: shell(
      "A couple ordered through your link 🎉",
      `
        <p style="color:#555;line-height:1.7;">
          Nice work, <strong>${params.contactName}</strong> — order
          <strong>#${shortId}</strong> just came in through your referral link.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;font-family:sans-serif;margin:20px 0;">
          <tr style="border-bottom:1px solid #E8E5DF;"><td style="padding:8px 0;color:#888;">Order total</td><td style="padding:8px 0;color:#2C2C2A;font-weight:600;text-align:right;">${formatUsdCents(params.orderTotalCents)}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Your estimated commission</td><td style="padding:8px 0;color:#8B9D77;font-weight:700;text-align:right;">${formatUsdCents(params.estimatedCommissionCents)}</td></tr>
        </table>
        <p style="color:#888;font-size:13px;line-height:1.7;">
          Commission is credited to your balance once the order is marked complete.
        </p>
        ${cta(`${APP_URL}/partner/orders`, "View your orders →")}
      `
    ),
  });
}
