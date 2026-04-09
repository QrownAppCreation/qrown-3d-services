import Link from "next/link";
import RequestTrackingLink from "@/app/my-order/RequestTrackingLink";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Track your order — WedPrint" };

export default function TrackOrderPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--wp-ivory)" }}>
      {/* Nav */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo width={180} href="/" />
          <Link href="/order/step1-style">
            <button className="btn-cta border-0 px-4 py-2 rounded-lg text-sm font-semibold text-white">
              Start an order
            </button>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <p className="text-5xl mb-4">🔗</p>
            <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--wp-charcoal)" }}>
              Track your order
            </h1>
            <p className="text-gray-500">
              Enter the email you used when ordering and we'll send you a link to view your
              order status, design previews, and approvals — no password needed.
            </p>
          </div>

          <RequestTrackingLink />

          <p className="text-center mt-6 text-sm text-gray-500 max-w-md mx-auto">
            After you open the link we email you, you can view your order and request a cancellation
            from your order page (refunds follow our time-based policy).
          </p>
          <p className="text-center mt-8 text-sm text-gray-400">
            Haven't ordered yet?{" "}
            <Link href="/order/step1-style" className="underline"
                  style={{ color: "var(--wp-sage)" }}>
              Start your order here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
