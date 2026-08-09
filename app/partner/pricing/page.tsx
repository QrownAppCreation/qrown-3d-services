import Link from "next/link";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Partner Program — WedPrint" };

// ── Plan data ─────────────────────────────────────────────────────────────────

interface Plan {
  key: string;
  name: string;
  price: string;
  period?: string;
  commission: string;
  tagline: string;
  popular?: boolean;
  cta: string;
  ctaHref: string;
  features: string[];
  accentColor: string;
  borderStyle?: string;
}

const PLANS: Plan[] = [
  {
    key: "starter",
    name: "Starter",
    price: "Free",
    commission: "8%",
    tagline: "Perfect for getting started with no upfront cost.",
    cta: "Apply free",
    ctaHref: "/partner/apply",
    accentColor: "var(--wp-sage)",
    features: [
      "8% commission on every order",
      "Up to 5 referred orders per month",
      "Your own referral link",
      "Partner dashboard",
      "Order + earnings tracking",
      "Email support",
    ],
  },
  {
    key: "professional",
    name: "Professional",
    price: "$49",
    period: "/month",
    commission: "12%",
    tagline: "For active photographers and planners who refer regularly.",
    popular: true,
    cta: "Apply now",
    ctaHref: "/partner/apply",
    accentColor: "var(--wp-gold)",
    borderStyle: "2px solid var(--wp-gold)",
    features: [
      "12% commission on every order",
      "Unlimited referred orders",
      "Your own referral link",
      "Full partner dashboard + analytics",
      "Monthly commission summary email",
      "Priority email support",
      "Early access to new products",
    ],
  },
  {
    key: "studio",
    name: "Studio",
    price: "$149",
    period: "/month",
    commission: "18%",
    tagline: "For studios and boutiques with high-volume client flow.",
    cta: "Apply now",
    ctaHref: "/partner/apply",
    accentColor: "var(--wp-cta)",
    features: [
      "18% commission on every order",
      "Unlimited referred orders",
      "Everything in Professional",
      "Dedicated account manager",
      "Co-marketing & social features",
      "WedPrint badge for your website",
      "Custom commission available",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "Custom",
    commission: "18%+",
    tagline: "For agencies, networks, and high-volume referral partners.",
    cta: "Contact us",
    ctaHref: "mailto:partners@wedprint3d.com",
    accentColor: "var(--wp-charcoal)",
    features: [
      "Custom commission structure",
      "Unlimited referred orders",
      "Everything in Studio",
      "Custom contract & terms",
      "White-label options",
      "API access (coming soon)",
      "Dedicated onboarding call",
    ],
  },
];

const FAQS = [
  {
    q: "How does the referral link work?",
    a: "When a couple clicks your unique link and places an order within 30 days, that order is credited to you — automatically. You don't need to do anything extra after sharing the link.",
  },
  {
    q: "When and how do I get paid?",
    a: "Commission is credited to your dashboard balance when an order reaches Complete status. You can request a payout at any time via your partner dashboard, and we'll process it within 5 business days.",
  },
  {
    q: "Can I upgrade my plan later?",
    a: "Yes. You can start on Starter for free and upgrade to Professional or Studio at any time from your dashboard. Subscription billing is coming soon — early partners will be grandfathered in at their application rate.",
  },
  {
    q: "What counts as a referred order?",
    a: "Any order placed by a couple who clicked your referral link within the last 30 days. First-touch attribution — if a couple clicks multiple partner links, the first link gets the credit.",
  },
  {
    q: "Is there a contract or long-term commitment?",
    a: "No contract on Starter, Professional, or Studio. Enterprise partners sign a custom agreement. Monthly plans can be cancelled any time.",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PartnerPricingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--wp-ivory)" }}>

      {/* Nav */}
      <nav
        className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm"
        style={{ borderColor: "var(--wp-border)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Logo width={180} href="/" />
          <Link href="/partner/apply">
            <button
              className="btn-cta flex items-center gap-2 rounded-xl border-0 px-5 py-2 text-sm font-semibold text-white"
            >
              Apply now
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-16 text-center">
        <p
          className="mb-3 text-xs uppercase tracking-[0.22em]"
          style={{ color: "var(--wp-gold)" }}
        >
          Partner Program
        </p>
        <h1
          className="mb-4 text-4xl leading-tight md:text-5xl"
          style={{ fontFamily: "var(--font-syne)", color: "var(--wp-charcoal)" }}
        >
          Earn on every topper your couples order.
        </h1>
        <p
          className="mx-auto max-w-2xl text-lg leading-relaxed"
          style={{ fontFamily: "var(--font-newsreader)", color: "var(--wp-muted)" }}
        >
          Photographers, planners, and bridal boutiques share a link — we handle
          design, printing, and delivery. You earn commission automatically.
        </p>
      </section>

      {/* Pricing cards */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className="relative flex flex-col rounded-2xl bg-white p-6 shadow-sm"
              style={{
                border: plan.borderStyle ?? "1px solid var(--wp-border)",
              }}
            >
              {plan.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: "var(--wp-gold)" }}
                >
                  Most popular
                </div>
              )}

              {/* Plan name + commission */}
              <div className="mb-4">
                <p
                  className="mb-1 text-xs font-semibold uppercase tracking-[0.16em]"
                  style={{ color: plan.accentColor }}
                >
                  {plan.name}
                </p>
                <div className="flex items-end gap-1">
                  <span
                    className="text-4xl font-bold"
                    style={{ fontFamily: "var(--font-syne)", color: "var(--wp-charcoal)" }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="mb-1 text-sm" style={{ color: "var(--wp-muted)" }}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className="mt-1 text-lg font-semibold"
                  style={{ color: plan.accentColor }}
                >
                  {plan.commission} commission
                </p>
                <p className="mt-2 text-sm leading-snug" style={{ color: "var(--wp-muted)" }}>
                  {plan.tagline}
                </p>
              </div>

              {/* Features */}
              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--wp-charcoal)" }}>
                    <Check
                      className="mt-0.5 h-4 w-4 flex-shrink-0"
                      style={{ color: plan.accentColor }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={plan.ctaHref}>
                <button
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={
                    plan.popular
                      ? { backgroundColor: "var(--wp-gold)", color: "#fff", border: "none" }
                      : {
                          backgroundColor: "transparent",
                          color: "var(--wp-charcoal)",
                          border: "1.5px solid var(--wp-border)",
                        }
                  }
                >
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Subscription billing note */}
        <p className="mt-6 text-center text-sm" style={{ color: "var(--wp-muted)" }}>
          Professional and Studio subscription billing coming soon. Apply now and lock in your plan — early partners are grandfathered in.
        </p>
      </section>

      {/* How it works */}
      <section
        className="border-t py-16"
        style={{ borderColor: "var(--wp-border)", backgroundColor: "white" }}
      >
        <div className="mx-auto max-w-4xl px-6">
          <h2
            className="mb-10 text-center text-3xl"
            style={{ fontFamily: "var(--font-syne)", color: "var(--wp-charcoal)" }}
          >
            How it works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Apply",
                body: "Fill out the short application. We review every partner by hand — usually within two business days.",
              },
              {
                step: "2",
                title: "Share your link",
                body: "Once approved, you get a unique referral link to add to your galleries, welcome guides, and client emails.",
              },
              {
                step: "3",
                title: "Earn",
                body: "Every couple who orders through your link earns you commission, credited automatically when their order completes.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="text-center">
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: "var(--wp-sage)" }}
                >
                  <span
                    className="text-lg font-bold"
                    style={{ fontFamily: "var(--font-syne)" }}
                  >
                    {step}
                  </span>
                </div>
                <h3
                  className="mb-2 text-lg font-semibold"
                  style={{ fontFamily: "var(--font-syne)", color: "var(--wp-charcoal)" }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--wp-muted)" }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2
          className="mb-8 text-center text-3xl"
          style={{ fontFamily: "var(--font-syne)", color: "var(--wp-charcoal)" }}
        >
          Questions
        </h2>
        <div className="space-y-6">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--wp-border)" }}>
              <p className="mb-2 font-semibold" style={{ color: "var(--wp-charcoal)" }}>
                {q}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--wp-muted)" }}>
                {a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        className="border-t py-16 text-center"
        style={{ borderColor: "var(--wp-border)", backgroundColor: "white" }}
      >
        <div className="mx-auto max-w-xl px-6">
          <h2
            className="mb-3 text-3xl"
            style={{ fontFamily: "var(--font-syne)", color: "var(--wp-charcoal)" }}
          >
            Ready to start earning?
          </h2>
          <p className="mb-8 leading-relaxed" style={{ color: "var(--wp-muted)" }}>
            Free to join. No monthly fee on the Starter tier. Upgrade any time.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/partner/apply">
              <button
                className="btn-cta flex items-center gap-2 rounded-xl border-0 px-8 py-3 font-semibold text-white"
              >
                Apply now — it&apos;s free
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <a
              href="mailto:partners@wedprint3d.com"
              className="flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-medium"
              style={{ color: "var(--wp-muted)", border: "1.5px solid var(--wp-border)" }}
            >
              <MessageCircle className="h-4 w-4" />
              Talk to us first
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-8 text-center text-xs"
        style={{ borderColor: "var(--wp-border)", color: "var(--wp-muted)" }}
      >
        <Logo width={120} href="/" className="mx-auto mb-4" />
        <p>© {new Date().getFullYear()} WedPrint3D · Miami, FL</p>
        <p className="mt-1">
          Questions?{" "}
          <a href="mailto:partners@wedprint3d.com" className="underline">
            partners@wedprint3d.com
          </a>
        </p>
      </footer>
    </div>
  );
}
