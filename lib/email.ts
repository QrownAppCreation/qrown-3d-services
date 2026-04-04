import { Resend } from "resend";

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

// IMPORTANT — Resend domain verification required before going live:
// 1. Go to https://resend.com/domains and add "wedprint3d.com"
// 2. Resend will give you TXT + MX DNS records to add in Namecheap
// 3. Once verified, set FROM_EMAIL=hello@wedprint3d.com in your .env / Vercel env vars
// 4. In development you can use "onboarding@resend.dev" with no verification needed
const FROM = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
const OPERATOR_EMAIL = process.env.OPERATOR_EMAIL ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendMagicLinkEmail(
  email: string,
  name: string,
  magicUrl: string
) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Your WedPrint login link",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Hi ${name || "there"} 👋</h2>
        <p>Click the button below to log in to WedPrint. This link expires in 1 hour.</p>
        <a href="${magicUrl}" style="
          display: inline-block;
          background: #1a1a1a;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin: 16px 0;
        ">Log in to WedPrint</a>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(params: {
  email: string;
  coupleName: string;
  partner1Name: string | null;
  partner2Name: string | null;
  orderId: string;
  depositPaidCents: number;
  balanceDueCents: number;
  productLines: string[];
  addOnLines: string[];
  magicLinkUrl?: string | null;
}) {
  const {
    email,
    coupleName,
    partner1Name,
    partner2Name,
    orderId,
    depositPaidCents,
    balanceDueCents,
    productLines,
    addOnLines,
    magicLinkUrl,
  } = params;

  const fmt = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);

  const greeting =
    partner1Name && partner2Name
      ? `${partner1Name} & ${partner2Name}`
      : coupleName;

  const allLines = [...productLines, ...addOnLines];

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Your WedPrint order is confirmed!",
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FAFAF7;">
        <!-- Header -->
        <div style="background: #2d2d2a; padding: 32px; text-align: center;">
          <h1 style="color: #C9A84C; margin: 0; font-size: 28px; letter-spacing: 2px;">WedPrint</h1>
          <p style="color: #fff; margin: 8px 0 0; font-size: 13px; letter-spacing: 1px;">Handcrafted 3D Keepsakes</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 36px;">
          <h2 style="color: #2d2d2a; margin-top: 0;">Your order is confirmed! 🎉</h2>
          <p style="color: #555; line-height: 1.7;">
            Hi <strong>${greeting}</strong>, thank you so much for placing your order with WedPrint.
            We are absolutely thrilled to be a small part of your big day.
          </p>

          <!-- Order summary box -->
          <div style="background: #fff; border: 1px solid #e5e5e0; border-radius: 10px; padding: 24px; margin: 28px 0;">
            <h3 style="color: #2d2d2a; margin-top: 0; font-size: 16px;">Order Summary</h3>
            <p style="color: #888; font-size: 13px; margin: 0 0 16px;">
              Reference: <strong style="color: #2d2d2a;">#${orderId.slice(-8).toUpperCase()}</strong>
            </p>

            ${allLines.map((line) => `
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0ea; font-size: 14px; color: #555;">
                <span>• ${line}</span>
              </div>
            `).join("")}

            <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #e5e5e0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: #555; font-size: 14px;">Deposit paid today:</span>
                <strong style="color: #8FAF8F; font-size: 14px;">${fmt(depositPaidCents)}</strong>
              </div>
              <div style="margin-top: 12px; background: #f0f4f0; border-radius: 6px; padding: 12px; font-size: 14px; color: #444; line-height: 1.6;">
                Your 50% deposit has been received. The remaining balance of
                <strong>${fmt(balanceDueCents)}</strong> will be collected once you
                approve your design preview. We will send your design preview within 48 hours.
              </div>
            </div>
          </div>

          <!-- What happens next -->
          <h3 style="color: #2d2d2a; font-size: 16px;">What happens next?</h3>
          <ol style="color: #555; line-height: 2; padding-left: 20px; font-size: 14px;">
            <li>Our team begins designing your piece within 24 hours</li>
            <li>You'll receive an email with an interactive 3D preview to review and approve</li>
            <li>Once you approve, we print and contact you to arrange delivery</li>
            <li>The balance (${fmt(balanceDueCents)}) is due on delivery</li>
          </ol>

          <p style="color: #8FAF8F; font-weight: bold; font-size: 15px;">
            ⏱ Estimated turnaround: 7–10 business days
          </p>

          <!-- CTA -->
          ${magicLinkUrl ? `
          <div style="text-align: center; margin: 32px 0;">
            <a href="${magicLinkUrl}" style="
              display: inline-block;
              background: #8FAF8F;
              color: white;
              padding: 14px 32px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              font-size: 15px;
              font-family: sans-serif;
            ">View your order status →</a>
            <p style="color:#888;font-size:12px;font-family:sans-serif;margin-top:8px;">
              Bookmark this link — it gives you access to your order anytime (valid 30 days).
            </p>
          </div>
          ` : `
          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/order-confirmed" style="
              display: inline-block;
              background: #C4622D;
              color: white;
              padding: 14px 32px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              font-size: 15px;
              font-family: sans-serif;
            ">View Order Confirmation</a>
          </div>
          `}

          <p style="color: #888; font-size: 13px; line-height: 1.7; border-top: 1px solid #e5e5e0; padding-top: 24px; margin-top: 32px;">
            We can't wait to create something truly special for you both. If you have any questions at all,
            simply reply to this email and we'll get back to you right away. 💛
            <br /><br />
            With love,<br />
            <strong style="color: #2d2d2a;">The WedPrint Team</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #2d2d2a; padding: 20px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} WedPrint · Made with love
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendOperatorNotification(
  message: string,
  orderId?: string
) {
  if (!OPERATOR_EMAIL) return;

  const orderLink = orderId
    ? `${APP_URL}/operator/orders/${orderId}`
    : undefined;

  await getResend().emails.send({
    from: FROM,
    to: OPERATOR_EMAIL,
    subject: `[WedPrint] ${message}`,
    html: `
      <div style="font-family: sans-serif;">
        <p>${message}</p>
        ${orderLink ? `<p><a href="${orderLink}">View order →</a></p>` : ""}
      </div>
    `,
  });
}

export async function sendDesignReadyEmail(params: {
  email: string;
  coupleName: string;
  previewImageUrl: string;
  approvalUrl: string;
  deadline: string;
}) {
  const { email, coupleName, previewImageUrl, approvalUrl, deadline } = params;

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Your WedPrint design is ready to review!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a1a; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">WedPrint</h1>
        </div>
        <div style="padding: 32px;">
          <h2>Your design is ready, ${coupleName}! ✨</h2>
          <p>We've finished your 3D design preview. Take a look and let us know what you think!</p>
          
          ${
            previewImageUrl
              ? `<img src="${previewImageUrl}" alt="Design preview" style="width: 100%; border-radius: 8px; margin: 20px 0;" />`
              : ""
          }
          
          <a href="${approvalUrl}" style="
            display: inline-block;
            background: #1a1a1a;
            color: white;
            padding: 14px 28px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
          ">Review Your Design</a>
          
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            Please respond by <strong>${deadline}</strong>. After that, your link will expire 
            and you'll need to contact us for a new one.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendApprovalConfirmationEmail(params: {
  email: string;
  coupleName: string;
  orderId: string;
}) {
  const { email, coupleName, orderId } = params;

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Design approved — heading to print! 🖨️",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a1a; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">WedPrint</h1>
        </div>
        <div style="padding: 32px;">
          <h2>Design approved, ${coupleName}! 🎉</h2>
          <p>Your design has been approved and is now in the print queue. We'll be in touch soon with your completed order!</p>
          <a href="${APP_URL}/order/${orderId}" style="
            display: inline-block;
            background: #1a1a1a;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
          ">Track Your Order</a>
        </div>
      </div>
    `,
  });
}

export async function sendBalancePaymentEmail(params: {
  email: string;
  coupleName: string;
  balanceCents: number;
  paymentUrl: string;
  orderId: string;
}) {
  const { email, coupleName, balanceCents, paymentUrl, orderId } = params;

  const fmt = (c: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(c / 100);

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Your WedPrint design is approved — pay your balance to go to print!",
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FAFAF7;">
        <div style="background: #2d2d2a; padding: 32px; text-align: center;">
          <h1 style="color: #C9A84C; margin: 0; font-size: 28px; letter-spacing: 2px;">WedPrint</h1>
          <p style="color: #fff; margin: 8px 0 0; font-size: 13px; letter-spacing: 1px;">Handcrafted 3D Keepsakes</p>
        </div>
        <div style="padding: 40px 36px;">
          <h2 style="color: #2d2d2a; margin-top: 0;">Great news, ${coupleName}! 🎉</h2>
          <p style="color: #555; line-height: 1.7;">
            Your design has been approved and is ready to go to print. To complete your order,
            please pay the remaining balance of <strong style="color: #2d2d2a;">${fmt(balanceCents)}</strong>
            using the secure link below.
          </p>

          <div style="background: #fff; border: 1px solid #e5e5e0; border-radius: 10px; padding: 20px; margin: 24px 0; text-align: center;">
            <p style="color: #555; font-size: 14px; margin: 0 0 16px;">
              Order reference: <strong>#${orderId.slice(-8).toUpperCase()}</strong>
            </p>
            <p style="color: #2d2d2a; font-size: 22px; font-weight: bold; margin: 0 0 20px;">
              Balance due: ${fmt(balanceCents)}
            </p>
            <a href="${paymentUrl}" style="
              display: inline-block;
              background: #C4622D;
              color: white;
              padding: 16px 36px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              font-size: 16px;
              font-family: sans-serif;
            ">Pay Balance Now →</a>
            <p style="color: #888; font-size: 12px; margin: 16px 0 0;">
              Secure payment powered by Stripe. This link is unique to your order.
            </p>
          </div>

          <p style="color: #555; line-height: 1.7; font-size: 14px;">
            Once your payment is confirmed, your piece will go straight into the print queue.
            We'll be in touch as soon as it's ready to arrange delivery.
          </p>

          <p style="color: #888; font-size: 13px; line-height: 1.7; border-top: 1px solid #e5e5e0; padding-top: 24px; margin-top: 32px;">
            Questions? Simply reply to this email and we'll get back to you right away. 💛
            <br /><br />
            With love,<br />
            <strong style="color: #2d2d2a;">The WedPrint Team</strong>
          </p>
        </div>
        <div style="background: #2d2d2a; padding: 20px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} WedPrint · Made with love
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendOrderCompleteEmail(params: {
  email: string;
  coupleName: string;
  balanceDue: string;
}) {
  const { email, coupleName, balanceDue } = params;

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Your WedPrint order is ready! 🎊",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a1a; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">WedPrint</h1>
        </div>
        <div style="padding: 32px;">
          <h2>Your order is ready, ${coupleName}! 🎊</h2>
          <p>Your WedPrint creation is finished and ready for pickup or delivery.</p>
          
          <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Balance due on pickup:</strong> ${balanceDue}</p>
          </div>
          
          <p>Please reply to this email to arrange pickup or confirm your delivery address.</p>
        </div>
      </div>
    `,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendCancellationEmail(params: {
  email: string;
  coupleName: string;
  orderId: string;
  refundAmountCents: number;
  cancelledBy: "customer" | "operator";
  cancellationReason?: string | null;
  policyNote?: string | null;
}) {
  const {
    email,
    coupleName,
    orderId,
    refundAmountCents,
    cancelledBy,
    cancellationReason,
    policyNote,
  } = params;

  const fmt = (c: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(c / 100);

  const orderRef = `#${orderId.slice(-8).toUpperCase()}`;
  const hasRefund = refundAmountCents > 0;

  const reasonBlock =
    cancelledBy === "operator" && cancellationReason?.trim()
      ? `<p style="color:#555;line-height:1.7;font-size:14px;margin:16px 0 0;padding:12px 14px;background:#f5f5f0;border-radius:8px;border-left:3px solid #8B9D77;">
          <strong style="color:#2d2d2a;">Note from our team:</strong><br/>
          ${escapeHtml(cancellationReason.trim())}
        </p>`
      : "";

  const policyBlock = policyNote?.trim()
    ? `<p style="color:#666;font-size:14px;line-height:1.6;margin:16px 0 0;">${escapeHtml(policyNote.trim())}</p>`
    : "";

  const refundSection = hasRefund
    ? `<div style="background: #fff; border: 1px solid #e5e5e0; border-radius: 10px; padding: 20px; margin: 24px 0;">
          <p style="color: #555; font-size: 14px; margin: 0 0 8px;">Refund amount</p>
          <p style="font-size: 22px; font-weight: bold; color: #2d2d2a; margin: 0 0 8px;">${fmt(refundAmountCents)}</p>
          <p style="color: #888; font-size: 13px; margin: 0;">
            Refunds typically appear on your card statement within <strong>3–5 business days</strong> (some banks may take longer).
          </p>
        </div>`
    : `<div style="background: #fff; border: 1px solid #e5e5e0; border-radius: 10px; padding: 20px; margin: 24px 0;">
          <p style="color: #555; font-size: 14px; margin: 0;">
            <strong>No refund was issued</strong> for this cancellation, per our policy.
          </p>
        </div>`;

  await getResend().emails.send({
    from:    FROM,
    to:      email,
    subject: `Your WedPrint order ${orderRef} has been cancelled`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FAFAF7;">
        <div style="background: #2d2d2a; padding: 32px; text-align: center;">
          <h1 style="color: #C9A84C; margin: 0; font-size: 28px; letter-spacing: 2px;">WedPrint</h1>
          <p style="color: #fff; margin: 8px 0 0; font-size: 13px; letter-spacing: 1px;">Handcrafted 3D Keepsakes</p>
        </div>
        <div style="padding: 40px 36px;">
          <h2 style="color: #2d2d2a; margin-top: 0;">Order cancelled</h2>
          <p style="color: #555; line-height: 1.7;">
            Hi <strong>${escapeHtml(coupleName)}</strong>,<br/><br/>
            Your WedPrint order <strong>${orderRef}</strong> has been cancelled.
          </p>
          ${reasonBlock}
          ${policyBlock}
          ${refundSection}
          <p style="color: #555; line-height: 1.7; font-size: 14px;">
            Questions? Reply to this email or contact us at
            <a href="mailto:support@wedprint3d.com" style="color: #8FAF8F;">support@wedprint3d.com</a>.
            You can also visit <a href="${APP_URL}" style="color: #8FAF8F;">wedprint3d.com</a>.
          </p>
          <p style="color: #888; font-size: 13px; line-height: 1.7; border-top: 1px solid #e5e5e0; padding-top: 24px; margin-top: 32px;">
            — The WedPrint Team
          </p>
        </div>
        <div style="background: #2d2d2a; padding: 20px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} WedPrint · Made with love</p>
        </div>
      </div>
    `,
  });
}

// ── Magic link for order tracking ───────────────────────────────────────────
export async function sendOrderTrackingLinkEmail(params: {
  email: string;
  name: string;
  magicLinkUrl: string;
}) {
  const { email, name, magicLinkUrl } = params;

  await getResend().emails.send({
    from:    FROM,
    to:      email,
    subject: "Your WedPrint order tracking link",
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;background:#FAFAF7;">
        <div style="background:#2d2d2a;padding:28px;text-align:center;">
          <h1 style="color:#C9A84C;margin:0;font-size:24px;letter-spacing:2px;">WedPrint</h1>
        </div>
        <div style="padding:36px;">
          <h2 style="color:#2d2d2a;margin-top:0;">Here's your order tracking link 🔗</h2>
          <p style="color:#555;line-height:1.7;">
            Hi <strong>${name}</strong>, as requested here is a fresh link to view your order status.
            No password needed — just click and go.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${magicLinkUrl}" style="
              display:inline-block;background:#8FAF8F;color:white;
              padding:14px 32px;border-radius:8px;text-decoration:none;
              font-weight:600;font-size:15px;
            ">View my order →</a>
            <p style="color:#888;font-size:12px;margin-top:10px;">
              This link is valid for 30 days.
            </p>
          </div>
          <p style="color:#888;font-size:13px;border-top:1px solid #e5e5e0;padding-top:20px;">
            Didn't request this? You can safely ignore this email.<br/>
            — The WedPrint Team
          </p>
        </div>
      </div>
    `,
  });
}
