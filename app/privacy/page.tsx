import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Privacy Policy — WedPrint" };

const EFFECTIVE = "1 January 2026";
const SUPPORT   = "support@wedprint3d.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--wp-ivory)" }}>
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
           style={{ borderColor: "var(--wp-border)" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo width={180} href="/" />
          <Link href="/" className="text-sm hover:underline" style={{ color: "var(--wp-sage)" }}>← Home</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--wp-charcoal)" }}>Privacy Policy</h1>
        <p className="text-sm mb-10" style={{ color: "var(--wp-muted)" }}>Effective date: {EFFECTIVE}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm leading-7"
             style={{ color: "var(--wp-charcoal)" }}>

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Who we are</h2>
            <p>WedPrint ("we", "us", "our") is a custom 3D printing service operating at wedprint3d.com, serving couples in the Miami, FL area. We create personalised wedding keepsakes from photos you provide.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information we collect</h2>
            <p>We collect information you provide directly when you place an order or contact us:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2" style={{ color: "var(--wp-muted)" }}>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Personal details:</strong> Your name, email address, and phone number.</li>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Order details:</strong> Wedding date, style preferences, colour palette, and special notes.</li>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Photos:</strong> Face photos, outfit references, pet photos, and inspiration images you upload. These are used solely to create your 3D design.</li>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Payment information:</strong> Stripe processes all payments. We never store your card details on our servers.</li>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Usage data:</strong> Basic analytics about how you use our website (pages visited, time on site).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How we use your information</h2>
            <ul className="list-disc pl-5 space-y-1" style={{ color: "var(--wp-muted)" }}>
              <li>To create your custom 3D design from your photos.</li>
              <li>To communicate with you about your order status and design previews.</li>
              <li>To process payments via Stripe.</li>
              <li>To send you order confirmation and completion emails.</li>
              <li>To improve our service and resolve support requests.</li>
            </ul>
            <p className="mt-3">We do <strong>not</strong> sell your personal information or photos to third parties. Your photos are used exclusively for your order and are not shared, licensed, or used in any marketing without your explicit written consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Photo storage and retention</h2>
            <p>Photos you upload are stored securely in cloud storage (Cloudflare R2) and are accessible only to the WedPrint team for the purpose of fulfilling your order. We retain photos for <strong>90 days</strong> after your order is complete, after which they are permanently deleted unless you have given consent for portfolio use.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Third-party services</h2>
            <p>We use the following third-party services, each with their own privacy policies:</p>
            <ul className="list-disc pl-5 space-y-1" style={{ color: "var(--wp-muted)" }}>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Stripe</strong> — payment processing (stripe.com/privacy)</li>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Resend</strong> — transactional email delivery (resend.com/privacy)</li>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Supabase</strong> — database hosting (supabase.com/privacy)</li>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Cloudflare R2</strong> — file storage (cloudflare.com/privacypolicy)</li>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Vercel</strong> — website hosting (vercel.com/legal/privacy-policy)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Your rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1" style={{ color: "var(--wp-muted)" }}>
              <li>Request access to the personal data we hold about you.</li>
              <li>Request deletion of your data and photos.</li>
              <li>Correct inaccurate information.</li>
              <li>Withdraw consent for marketing communications at any time.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, email us at <a href={`mailto:${SUPPORT}`} className="underline" style={{ color: "var(--wp-sage)" }}>{SUPPORT}</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
            <p>We use only essential cookies required for the website to function (e.g. your session token and order draft). We do not use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Changes to this policy</h2>
            <p>We may update this privacy policy from time to time. When we do, we will update the effective date at the top of this page. Continued use of our service after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
            <p>If you have any questions about this privacy policy, please contact us at <a href={`mailto:${SUPPORT}`} className="underline" style={{ color: "var(--wp-sage)" }}>{SUPPORT}</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t text-sm" style={{ borderColor: "var(--wp-border)", color: "var(--wp-muted)" }}>
          <Link href="/terms" className="underline mr-6" style={{ color: "var(--wp-sage)" }}>Terms of Service</Link>
          <Link href="/"      className="underline"      style={{ color: "var(--wp-sage)" }}>← Back to WedPrint</Link>
        </div>
      </main>
    </div>
  );
}
