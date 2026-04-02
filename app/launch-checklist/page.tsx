"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft, CheckCircle2, Circle, ExternalLink } from "lucide-react";

const ITEMS = [
  {
    id: "stripe-live",
    label: "Stripe live keys set",
    detail: "Replace sk_test_ keys with sk_live_ keys in Vercel environment variables (STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY).",
    helpUrl: "https://dashboard.stripe.com/apikeys",
    helpLabel: "Stripe API Keys",
  },
  {
    id: "stripe-webhook",
    label: "Webhook configured",
    detail: "Add https://wedprint3d.com/api/webhooks/stripe as an endpoint in Stripe. Select the checkout.session.completed event. Copy the signing secret into STRIPE_WEBHOOK_SECRET.",
    helpUrl: "https://dashboard.stripe.com/webhooks",
    helpLabel: "Stripe Webhooks",
  },
  {
    id: "test-order",
    label: "Test order placed",
    detail: "Place a complete end-to-end test order using Stripe test card 4242 4242 4242 4242. Go through all 6 wizard steps and complete checkout.",
    helpUrl: "/order/step1-style",
    helpLabel: "Start test order",
  },
  {
    id: "confirm-email",
    label: "Confirmation email received",
    detail: "After placing the test order, verify the confirmation email arrives in your inbox with the correct order details, magic link, and deposit amount.",
  },
  {
    id: "pricing-reviewed",
    label: "Pricing page reviewed",
    detail: "Check /pricing to confirm all tier prices are correct: Classic $79–$18, Duo $99–$24, Signature $124–$30, Heirloom $154–$38.",
    helpUrl: "/pricing",
    helpLabel: "View pricing page",
  },
  {
    id: "dashboard-ok",
    label: "Operator dashboard accessible",
    detail: "Log in to /operator/login and confirm orders appear, status badges work, and the color tier badges display correctly.",
    helpUrl: "/operator/login",
    helpLabel: "Go to operator login",
  },
  {
    id: "domain-live",
    label: "Domain live",
    detail: "Confirm https://wedprint3d.com resolves to your Vercel deployment. Check DNS is pointing to Vercel (cname.vercel-dns.com or your assigned IP).",
    helpUrl: "https://vercel.com/dashboard",
    helpLabel: "Vercel dashboard",
  },
  {
    id: "ssl-active",
    label: "SSL active",
    detail: "Visit https://wedprint3d.com and confirm the padlock icon appears in the browser. Vercel provisions SSL automatically — check it has provisioned in the Domains section.",
    helpUrl: "https://vercel.com/dashboard",
    helpLabel: "Check Vercel domains",
  },
] as const;

type ItemId = typeof ITEMS[number]["id"];

export default function LaunchChecklistPage() {
  const [checked, setChecked] = useState<Set<ItemId>>(new Set());

  function toggle(id: ItemId) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const done  = checked.size;
  const total = ITEMS.length;
  const allDone = done === total;

  return (
    <div className="min-h-screen" style={{ background: "var(--wp-ivory)" }}>

      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
           style={{ borderColor: "var(--wp-border)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-5 w-5" style={{ color: "var(--wp-cta)", fill: "var(--wp-cta)" }} />
            <span className="font-bold text-lg" style={{ color: "var(--wp-charcoal)" }}>WedPrint</span>
          </Link>
          <Link href="/operator/dashboard"
                className="flex items-center gap-1.5 text-sm hover:underline"
                style={{ color: "var(--wp-sage)" }}>
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--wp-charcoal)" }}>
            Launch Checklist
          </h1>
          <p style={{ color: "var(--wp-muted)" }}>
            Tick off each item before accepting real orders at wedprint3d.com.
          </p>
        </div>

        {/* Progress bar */}
        <div className="rounded-2xl p-5 mb-8"
             style={{ background: allDone ? "#f0fdf4" : "var(--wp-secondary-bg)", border: `1px solid ${allDone ? "#bbf7d0" : "var(--wp-border)"}` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm" style={{ color: "var(--wp-charcoal)" }}>
              {allDone ? "All done! Ready to go live." : `${done} of ${total} items complete`}
            </span>
            <span className="text-sm font-bold" style={{ color: allDone ? "#16a34a" : "var(--wp-sage)" }}>
              {Math.round((done / total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-2.5 overflow-hidden" style={{ border: "1px solid var(--wp-border)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width:      `${(done / total) * 100}%`,
                background: allDone ? "#16a34a" : "var(--wp-sage)",
              }}
            />
          </div>
          {allDone && (
            <p className="text-sm text-green-700 mt-3 font-medium">
              Your WedPrint site is ready to take real orders!
            </p>
          )}
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {ITEMS.map((item) => {
            const isDone = checked.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className="w-full rounded-2xl p-5 text-left flex items-start gap-4 transition-all"
                style={{
                  background:   isDone ? "#f0fdf4" : "#ffffff",
                  border:       `1px solid ${isDone ? "#bbf7d0" : "var(--wp-border)"}`,
                  cursor:       "pointer",
                }}
              >
                {/* Checkbox icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {isDone
                    ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                    : <Circle       className="h-5 w-5" style={{ color: "var(--wp-muted)" }} />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm mb-1 ${isDone ? "line-through text-green-700" : ""}`}
                     style={isDone ? undefined : { color: "var(--wp-charcoal)" }}>
                    {item.label}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--wp-muted)" }}>
                    {item.detail}
                  </p>
                  {"helpUrl" in item && item.helpUrl && (
                    <a
                      href={item.helpUrl}
                      target={item.helpUrl.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs mt-2 underline"
                      style={{ color: "var(--wp-sage)" }}
                    >
                      {item.helpLabel}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-center mt-8" style={{ color: "var(--wp-muted)" }}>
          Progress is not saved between page loads. This checklist is for your reference only.
        </p>
      </main>
    </div>
  );
}
