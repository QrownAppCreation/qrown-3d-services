export const dynamic = "force-dynamic";

import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Heart, Mail, Package, Calendar } from "lucide-react";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function OrderConfirmedPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  // ── 1. Retrieve Stripe session to get the orderId from metadata ────────────
  let orderId: string | null = null;

  if (session_id) {
    try {
      const stripeSession = await getStripe().checkout.sessions.retrieve(
        session_id,
        { expand: ["payment_intent"] }
      );
      orderId = stripeSession.metadata?.orderId ?? null;
    } catch (err) {
      console.error("Could not retrieve Stripe session:", err);
    }
  }

  // ── 2. Fetch order from the database ─────────────────────────────────────
  const order = orderId
    ? await db.order
        .findUnique({
          where: { id: orderId },
          include: {
            couple: true,
            designs: {
              select: {
                id: true,
                category: true,
                quantity: true,
                partner1Name: true,
                partner2Name: true,
              },
            },
            addOns: true,
          },
        })
        .catch(() => null)
    : null;

  // ── 3. Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--wp-ivory)" }}>

      {/* Simple nav strip */}
      <nav className="border-b border-border bg-white/80 px-6 py-4 flex items-center gap-2">
        <Heart className="h-4 w-4 fill-[var(--wp-cta)]" style={{ color: "var(--wp-cta)" }} />
        <span className="font-bold">WedPrint</span>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full space-y-6">

          {/* Big confirmation icon */}
          <div className="text-center space-y-3">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg"
              style={{ backgroundColor: "var(--wp-sage)" }}
            >
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Order confirmed!</h1>
            <p className="text-muted-foreground text-lg">
              Thank you — your deposit has been received.
            </p>
          </div>

          {/* Main info card */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-5">

            {order ? (
              <>
                {/* Order ID */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Order reference</span>
                  <span className="font-mono font-semibold text-base">
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                </div>

                {/* Couple name */}
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 flex-shrink-0" style={{ color: "var(--wp-cta)" }} />
                  <div>
                    <p className="font-semibold">{order.couple.name}</p>
                    {order.designs[0]?.partner1Name && order.designs[0]?.partner2Name && (
                      <p className="text-sm text-muted-foreground">
                        {order.designs[0].partner1Name} &amp; {order.designs[0].partner2Name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 flex-shrink-0" style={{ color: "var(--wp-sage)" }} />
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmation sent to</p>
                    <p className="font-medium">{order.couple.email}</p>
                  </div>
                </div>

                {/* Products */}
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "var(--wp-gold)" }} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground">What you ordered</p>
                    {order.designs.map((d) => (
                      <p key={d.id} className="font-medium text-sm">
                        {d.category.replace(/_/g, " ")} ×{d.quantity}
                      </p>
                    ))}
                    {order.addOns.map((a) => (
                      <p key={a.id} className="text-sm text-muted-foreground">
                        + {a.type.replace(/_/g, " ")} ×{a.quantity}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Payment summary */}
                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{ backgroundColor: "var(--wp-sage-light)" }}
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deposit paid today</span>
                    <span className="font-semibold" style={{ color: "var(--wp-sage)" }}>
                      {fmt(order.depositCents)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Balance due upon design approval</span>
                    <span className="font-medium">{fmt(order.balanceCents)}</span>
                  </div>
                </div>

                {/* Turnaround */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 flex-shrink-0" style={{ color: "var(--wp-gold)" }} />
                  <p className="text-sm">
                    <span className="text-muted-foreground">Estimated turnaround: </span>
                    <span className="font-semibold">7–10 business days</span>
                  </p>
                </div>
              </>
            ) : (
              /* Fallback if DB look-up fails */
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5" style={{ color: "var(--wp-sage)" }} />
                  <p className="text-sm text-muted-foreground">
                    A confirmation email is on its way to you.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Next steps */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="font-semibold mb-4">What happens next?</h2>
            <ol className="space-y-3">
              {[
                "Our team starts designing your piece within 24 hours",
                "You'll receive an email with an interactive 3D preview to approve",
                "Once you approve your design, we'll send you a secure balance payment link",
                "Once the balance is paid, your piece goes to print and we arrange delivery",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: "var(--wp-sage)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Inline note */}
          <p className="text-center text-sm text-muted-foreground">
            We&apos;ll be in touch within 48 hours with your design preview.
          </p>

          {/* CTA */}
          <div className="flex justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="btn-cta border-0 hover:opacity-90 px-10 gap-2"
              >
                <Heart className="h-4 w-4" />
                Return to home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
