import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Use FROM_EMAIL env var (must be a verified Resend sender in production)
const SUPPORT_EMAIL = "support@wedprint3d.com";
const FROM         = process.env.FROM_EMAIL ?? "onboarding@resend.dev";

export async function POST(req: NextRequest) {
  try {
    const { name, email, orderRef, message } = await req.json() as {
      name: string;
      email: string;
      orderRef?: string;
      message: string;
    };

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Forward message to support inbox
    await resend.emails.send({
      from:    FROM,
      to:      SUPPORT_EMAIL,
      replyTo: email,
      subject: `[WedPrint] Contact form — ${name}${orderRef ? ` (ref: ${orderRef})` : ""}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;">
          <h2 style="color:#2C2C2A;">New contact form submission</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:#6B6B67;width:120px;">Name</td>
                <td style="padding:6px 0;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:6px 0;color:#6B6B67;">Email</td>
                <td style="padding:6px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            ${orderRef ? `<tr><td style="padding:6px 0;color:#6B6B67;">Order ref</td>
                <td style="padding:6px 0;">${orderRef}</td></tr>` : ""}
            <tr><td style="padding:6px 0;color:#6B6B67;vertical-align:top;">Message</td>
                <td style="padding:6px 0;">${message.replace(/\n/g, "<br/>")}</td></tr>
          </table>
          <p style="margin-top:20px;font-size:12px;color:#6B6B67;">
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    // Auto-reply to the sender
    await resend.emails.send({
      from:    FROM,
      to:      email,
      subject: "We got your message — WedPrint",
      html: `
        <div style="font-family:sans-serif;max-width:540px;background:#FAFAF7;">
          <div style="background:#2C2C2A;padding:24px;text-align:center;">
            <h1 style="color:#C9A84C;margin:0;font-size:22px;letter-spacing:2px;">WedPrint</h1>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#2C2C2A;margin-top:0;">Thanks for reaching out, ${name}!</h2>
            <p style="color:#6B6B67;line-height:1.7;">
              We've received your message and will get back to you within <strong>24 hours</strong>.
            </p>
            <p style="color:#6B6B67;line-height:1.7;">
              In the meantime you can also reach us directly at
              <a href="mailto:${SUPPORT_EMAIL}" style="color:#8B9D77;">${SUPPORT_EMAIL}</a>.
            </p>
            <p style="color:#6B6B67;font-size:13px;border-top:1px solid #E8E5DF;padding-top:20px;margin-top:24px;">
              — The WedPrint Team
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Error:", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
