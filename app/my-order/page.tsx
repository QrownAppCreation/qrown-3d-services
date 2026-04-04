export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import RequestTrackingLink from "./RequestTrackingLink";
import CancelOrderButton from "./CancelOrderButton";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(cents: number) {
  return new Intl.NumberFormat("en-AU", {
    style:    "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

// Maps a status to which numbered step (1-6) is currently active
const STATUS_STEP: Record<OrderStatus, number> = {
  PENDING_PAYMENT:   1,
  PAID:              2,
  IN_DESIGN:         2,
  AWAITING_APPROVAL: 3,
  APPROVED:          4,
  BALANCE_PAID:      5,
  PRINTING:          5,
  COMPLETE:          6,
  CANCELLED:         0,
};

const STATUS_LABEL: Record<OrderStatus, { label: string; description: string; colour: string }> = {
  PENDING_PAYMENT:   { label: "Payment pending",          description: "Waiting for your deposit payment to be confirmed.",                  colour: "bg-gray-100 text-gray-600"   },
  PAID:              { label: "Payment received",         description: "Your deposit is in — we're getting started!",                        colour: "bg-green-100 text-green-700" },
  IN_DESIGN:         { label: "Design in progress",       description: "Our team is working on your 3D design.",                             colour: "bg-blue-100 text-blue-700"   },
  AWAITING_APPROVAL: { label: "Design ready to review!",  description: "Your design preview is ready. Please review and let us know!",       colour: "bg-amber-100 text-amber-700" },
  APPROVED:          { label: "Design approved",          description: "Lovely! We'll send your balance payment link shortly.",              colour: "bg-purple-100 text-purple-700"},
  BALANCE_PAID:      { label: "In the print queue",       description: "Balance received — your piece is queued for printing.",              colour: "bg-indigo-100 text-indigo-700"},
  PRINTING:          { label: "Printing now 🖨️",           description: "Your piece is being 3D printed!",                                   colour: "bg-blue-100 text-blue-700"   },
  COMPLETE:          { label: "Ready! 🎉",                description: "Your order is complete and ready for pickup or delivery.",           colour: "bg-green-100 text-green-700" },
  CANCELLED:         { label: "Cancelled",                description: "This order has been cancelled. Please contact us with any questions.",colour: "bg-red-100 text-red-600"     },
};

const STEPS = [
  { step: 1, label: "Order placed"        },
  { step: 2, label: "In design"           },
  { step: 3, label: "Design preview"      },
  { step: 4, label: "Design approved"     },
  { step: 5, label: "Printing"            },
  { step: 6, label: "Ready!"              },
];

// ── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function MyOrderPage({ searchParams }: Props) {
  const { token } = await searchParams;

  // No token — show the "request a link" prompt
  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4"
            style={{ background: "var(--wp-ivory)" }}>
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <p className="text-3xl mb-2">💌</p>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--wp-charcoal)" }}>
              Track your WedPrint order
            </h1>
            <p className="text-sm text-gray-500">
              Enter your email and we'll send you a link to view your order — no password needed.
            </p>
          </div>
          <RequestTrackingLink />
          <p className="text-center mt-6 text-sm text-gray-400">
            <Link href="/" className="hover:underline" style={{ color: "var(--wp-sage)" }}>
              ← Back to WedPrint
            </Link>
          </p>
        </div>
      </main>
    );
  }

  // Validate the token
  const couple = await db.couple.findFirst({
    where: {
      magicLinkToken: token,
      tokenExpiry:    { gt: new Date() },
    },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { designs: true, addOns: true },
      },
    },
  });

  // Expired or invalid token
  if (!couple) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4"
            style={{ background: "var(--wp-ivory)" }}>
        <div className="max-w-md w-full text-center">
          <p className="text-4xl mb-4">⏳</p>
          <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--wp-charcoal)" }}>
            This link has expired
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Order tracking links are valid for 30 days. Request a fresh one below.
          </p>
          <RequestTrackingLink />
          <p className="mt-6 text-sm text-gray-400">
            <Link href="/" className="hover:underline" style={{ color: "var(--wp-sage)" }}>
              ← Back to WedPrint
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const { orders } = couple;

  return (
    <main className="min-h-screen" style={{ background: "var(--wp-ivory)" }}>
      {/* Nav */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight" style={{ color: "var(--wp-charcoal)" }}>
            WedPrint
          </Link>
          <span className="text-sm text-gray-500">
            Hi, <strong style={{ color: "var(--wp-charcoal)" }}>{couple.name}</strong>!
          </span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">

        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--wp-charcoal)" }}>
            Your order{orders.length > 1 ? "s" : ""}
          </h1>
          <p className="text-gray-500 text-sm">{couple.email}</p>
        </div>

        {orders.length === 0 && (
          <div className="bg-white rounded-xl border border-border p-10 text-center text-gray-400">
            No orders found yet.{" "}
            <Link href="/order/step1-style" className="underline" style={{ color: "var(--wp-sage)" }}>
              Start an order
            </Link>
          </div>
        )}

        {orders.map((order) => {
          const statusInfo  = STATUS_LABEL[order.status] ?? STATUS_LABEL.PENDING_PAYMENT;
          const activeStep  = STATUS_STEP[order.status] ?? 1;
          const shortId     = order.id.slice(-8).toUpperCase();

          // Designs awaiting client approval
          const pendingDesigns = order.designs.filter(
            (d) => d.status === "CLIENT_SENT" && d.approvalToken
          );

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">

              {/* Order header */}
              <div className="px-6 py-5 border-b border-border flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order</p>
                  <p className="font-bold text-lg" style={{ color: "var(--wp-charcoal)" }}>#{shortId}</p>
                  {order.weddingDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      Wedding date: {new Date(order.weddingDate).toLocaleDateString("en-AU", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full self-start ${statusInfo.colour}`}>
                  {statusInfo.label}
                </span>
              </div>

              {/* Progress timeline */}
              {order.status !== "CANCELLED" && (
                <div className="px-6 py-5 border-b border-border">
                  <div className="flex items-center gap-0 overflow-x-auto pb-2">
                    {STEPS.map(({ step, label }, idx) => {
                      const done    = activeStep > step;
                      const current = activeStep === step;
                      return (
                        <div key={step} className="flex items-center min-w-0">
                          {/* Node */}
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                done    ? "bg-[var(--wp-sage)] border-[var(--wp-sage)] text-white"
                                : current ? "bg-[var(--wp-gold)] border-[var(--wp-gold)] text-white animate-pulse"
                                : "bg-gray-100 border-gray-200 text-gray-400"
                              }`}
                            >
                              {done ? "✓" : step}
                            </div>
                            <span
                              className={`text-[10px] mt-1 text-center leading-tight max-w-[60px] ${
                                current ? "font-semibold" : "text-gray-400"
                              }`}
                              style={current ? { color: "var(--wp-charcoal)" } : {}}
                            >
                              {label}
                            </span>
                          </div>
                          {/* Connector */}
                          {idx < STEPS.length - 1 && (
                            <div
                              className="h-0.5 flex-1 mx-1 min-w-[16px]"
                              style={{
                                background: done
                                  ? "var(--wp-sage)"
                                  : "#e5e7eb",
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Status description */}
                  <p className="text-sm text-gray-600 mt-4 bg-gray-50 rounded-lg px-4 py-3">
                    {statusInfo.description}
                  </p>
                </div>
              )}

              {/* Design approval CTA */}
              {pendingDesigns.length > 0 && (
                <div className="px-6 py-5 border-b border-border"
                     style={{ background: "rgba(201,168,76,0.07)" }}>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--wp-charcoal)" }}>
                    Your design preview is ready!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Take a look at your 3D design and let us know if you love it or would like any tweaks.
                  </p>
                  {pendingDesigns.map((design) => (
                    <Link
                      key={design.id}
                      href={`/approval/${design.approvalToken}`}
                      className="inline-block btn-cta px-6 py-3 rounded-lg font-semibold text-sm text-white mr-3 mb-2"
                    >
                      Review & approve your design →
                    </Link>
                  ))}
                </div>
              )}

              {/* Products & Add-ons */}
              <div className="px-6 py-5 border-b border-border">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  What you ordered
                </h3>
                <div className="space-y-2">
                  {order.designs.map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-sm">
                      <span style={{ color: "var(--wp-charcoal)" }}>
                        {d.category.replace(/_/g, " ")}
                        {d.partner1Name && d.partner2Name && (
                          <span className="text-gray-400 ml-1">
                            ({d.partner1Name} &amp; {d.partner2Name})
                          </span>
                        )}
                      </span>
                      <span className="text-gray-400">×{d.quantity}</span>
                    </div>
                  ))}
                  {order.addOns.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm text-gray-500">
                      <span>{a.type.replace(/_/g, " ")}</span>
                      <span>{fmt(a.priceCents)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment summary */}
              <div className="px-6 py-5 border-t border-border">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Deposit paid</span>
                  <span className="font-semibold" style={{ color: "var(--wp-sage)" }}>
                    {fmt(order.depositCents)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Balance due upon design approval</span>
                  <span className="font-semibold" style={{ color: "var(--wp-charcoal)" }}>
                    {fmt(order.balanceCents)}
                  </span>
                </div>
              </div>

              <CancelOrderButton
                token={token}
                orderId={order.id}
                depositCents={order.depositCents}
                createdAtIso={order.createdAt.toISOString()}
                status={order.status}
                stripePaymentId={order.stripePaymentId}
              />
            </div>
          );
        })}

        {/* Footer note */}
        <div className="text-center text-sm text-gray-400 pb-10">
          <p>
            Questions?{" "}
            <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@wedprint.com"}`}
               className="underline" style={{ color: "var(--wp-sage)" }}>
              Email us
            </a>
            {" "}— we're always happy to help.
          </p>
          <p className="mt-2">
            <Link href="/" className="underline" style={{ color: "var(--wp-sage)" }}>
              ← Back to WedPrint
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
