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

const FROM = process.env.FROM_EMAIL ?? "hello@wedprint.com";
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
  orderId: string;
  depositPaid: string;
  balanceDue: string;
  products: string[];
}) {
  const { email, coupleName, orderId, depositPaid, balanceDue, products } =
    params;

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Order confirmed — WedPrint #${orderId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a1a; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">WedPrint</h1>
        </div>
        <div style="padding: 32px;">
          <h2>You're all set, ${coupleName}! 🎉</h2>
          <p>Your order has been confirmed. Our team will start working on your design within 24 hours.</p>
          
          <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Summary</h3>
            <p><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
            ${products.map((p) => `<p>• ${p}</p>`).join("")}
            <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
            <p><strong>Deposit paid:</strong> ${depositPaid}</p>
            <p><strong>Balance due on delivery:</strong> ${balanceDue}</p>
          </div>

          <p>We'll email you as soon as your 3D design is ready for approval.</p>
          
          <a href="${APP_URL}/order/${orderId}" style="
            display: inline-block;
            background: #1a1a1a;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
          ">View Your Order</a>
          
          <p style="color: #666; font-size: 14px; margin-top: 32px;">
            Questions? Reply to this email and we'll get back to you right away.
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
