import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Terms of Service — WedPrint" };

const EFFECTIVE = "1 January 2026";
const SUPPORT   = "support@wedprint3d.com";

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--wp-charcoal)" }}>Terms of Service</h1>
        <p className="text-sm mb-10" style={{ color: "var(--wp-muted)" }}>Effective date: {EFFECTIVE}</p>

        <div className="space-y-8 text-sm leading-7" style={{ color: "var(--wp-charcoal)" }}>

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of terms</h2>
            <p>By placing an order with WedPrint ("we", "us", "our") at wedprint3d.com, you agree to these Terms of Service. If you do not agree, please do not place an order.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. The order process</h2>
            <p>Our order process has five steps:</p>
            <ol className="list-decimal pl-5 space-y-1 mt-2" style={{ color: "var(--wp-muted)" }}>
              <li>You select a style tier and product(s).</li>
              <li>You upload reference photos and provide details.</li>
              <li>You select any add-ons and review your order.</li>
              <li>You pay a <strong style={{ color: "var(--wp-charcoal)" }}>50% deposit</strong> via Stripe to confirm the order.</li>
              <li>We design your piece, send you a 3D preview for approval, and collect the remaining 50% before printing.</li>
            </ol>
            <p className="mt-3">Your order is only confirmed once we receive payment of the deposit. We may decline orders at our discretion.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Design previews and approvals</h2>
            <p>We will send you a 3D preview of your design for approval before printing. You must review and respond within <strong>7 days</strong>. If we do not receive a response within 7 days, we may proceed with printing the approved design.</p>
            <p className="mt-2">Nothing is printed until you approve your design. If you are not happy with the preview, you may request revisions based on your tier:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2" style={{ color: "var(--wp-muted)" }}>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Standard:</strong> 1 revision included</li>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Premium:</strong> 3 revisions included</li>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Elite:</strong> Unlimited revisions</li>
            </ul>
            <p className="mt-2">Additional revisions beyond your tier allowance are available at $35 per round.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Turnaround times</h2>
            <ul className="list-disc pl-5 space-y-1" style={{ color: "var(--wp-muted)" }}>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Standard orders:</strong> 7–10 business days from design approval.</li>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Rush orders:</strong> 72 hours from design approval. A 50% surcharge applies.</li>
            </ul>
            <p className="mt-2">Turnaround times are estimates and not guaranteed. We are not liable for delays caused by circumstances outside our control (e.g. equipment failure, supply issues).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Pricing and payment</h2>
            <p>All prices are in USD. A 50% non-refundable deposit is required to start an order. The remaining 50% is due once you approve your design preview and before printing begins.</p>
            <p className="mt-2">Payments are processed securely by <strong>Stripe</strong>. WedPrint does not store your card details.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Refund policy</h2>
            <ul className="list-disc pl-5 space-y-1" style={{ color: "var(--wp-muted)" }}>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Before design work begins:</strong> Full deposit refund.</li>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>After design work begins:</strong> No refund of the deposit, as design time has been invested.</li>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>After printing begins:</strong> No refunds. The item is custom-made to your specifications.</li>
              <li><strong style={{ color: "var(--wp-charcoal)" }}>Defective or damaged items:</strong> We will reprint or provide a full refund at our discretion. Contact us within 7 days of receiving your order.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Intellectual property</h2>
            <p>By uploading photos to WedPrint, you confirm you have the right to use those photos and grant us a limited license to use them solely for the purpose of creating your order.</p>
            <p className="mt-2">The 3D design files (STL files) we create are owned by WedPrint. You receive the <strong>physical printed product</strong>. A digital STL file license may be purchased as an add-on, granting you a personal, non-commercial license to the file for your own use.</p>
            <p className="mt-2">We may use images of your completed product in our portfolio or marketing materials unless you opt out in writing at the time of order.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Photo quality</h2>
            <p>The quality of the final product depends on the quality and clarity of the photos you provide. We are not liable for designs that do not meet your expectations due to low-quality, blurry, or unclear photos. Please provide the best photos you have — clear, well-lit, front-facing images produce the best results.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Food safety (cake toppers)</h2>
            <p>Our cake toppers are printed in PLA filament and treated with a food-safe coating. However, 3D printed items are not suitable for direct food contact. The topper should be placed on the cake just before serving and removed before cutting. WedPrint is not liable for any issues arising from improper use of cake toppers in direct food contact.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, WedPrint&apos;s total liability to you for any claim arising from these terms or your order shall not exceed the amount you paid for the specific order in question.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
            <p>Questions about these terms? Email us at <a href={`mailto:${SUPPORT}`} className="underline" style={{ color: "var(--wp-sage)" }}>{SUPPORT}</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t text-sm" style={{ borderColor: "var(--wp-border)", color: "var(--wp-muted)" }}>
          <Link href="/privacy" className="underline mr-6" style={{ color: "var(--wp-sage)" }}>Privacy Policy</Link>
          <Link href="/"        className="underline"      style={{ color: "var(--wp-sage)" }}>← Back to WedPrint</Link>
        </div>
      </main>
    </div>
  );
}
