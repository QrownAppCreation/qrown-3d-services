import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { formatCents } from "@/lib/order-pricing";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Pricing — WedPrint" };

// ── Data ─────────────────────────────────────────────────────────────────────

interface TierDef {
  key: string;
  label: string;
  colors: number;
  description: string;
  tagline: string;
  badge: string;
  accent: string;
  dots: string[];
  popular?: boolean;
  prices: Record<string, number>;
}

const TIERS: TierDef[] = [
  {
    key:         "CLASSIC",
    label:       "Classic",
    colors:      1,
    description: "Clean, elegant, timeless",
    tagline:     "Perfect for minimalist couples",
    badge:       "bg-gray-100 text-gray-700",
    accent:      "#6B6B67",
    dots:        ["#2C2C2A"],
    prices: {
      "Cake Topper":    7900,
      "Bridal Gift":    4900,
      "Guest Favours":  8500,
      "Fridge Magnet":  1800,
    },
  },
  {
    key:         "DUO",
    label:       "Duo",
    colors:      2,
    description: "Skin tones and outfit colors distinguished",
    tagline:     "Our most popular tier",
    badge:       "bg-blue-100 text-blue-700",
    accent:      "#6366F1",
    dots:        ["#2C2C2A", "#C9A84C"],
    prices: {
      "Cake Topper":    9900,
      "Bridal Gift":    6200,
      "Guest Favours":  11000,
      "Fridge Magnet":  2400,
    },
    popular: true,
  },
  {
    key:         "SIGNATURE",
    label:       "Signature",
    colors:      3,
    description: "Full detail — hair, skin, and attire",
    tagline:     "Ideal for detailed outfits",
    badge:       "bg-purple-100 text-purple-700",
    accent:      "#9333EA",
    dots:        ["#2C2C2A", "#C9A84C", "#C4622D"],
    prices: {
      "Cake Topper":    12400,
      "Bridal Gift":    7800,
      "Guest Favours":  13800,
      "Fridge Magnet":  3000,
    },
  },
  {
    key:         "HEIRLOOM",
    label:       "Heirloom",
    colors:      4,
    description: "Maximum detail — multi-color outfits, accessories, pets",
    tagline:     "When every detail matters",
    badge:       "bg-amber-100 text-amber-700",
    accent:      "#C9A84C",
    dots:        ["#2C2C2A", "#8B9D77", "#C9A84C", "#C4622D"],
    prices: {
      "Cake Topper":    15400,
      "Bridal Gift":    9500,
      "Guest Favours":  16500,
      "Fridge Magnet":  3800,
    },
  },
];

const PRODUCTS = ["Cake Topper", "Bridal Gift", "Guest Favours", "Fridge Magnet"] as const;

const PRODUCT_NOTE: Record<string, string> = {
  "Guest Favours": "per 10 pieces",
  "Bridal Gift":   "per piece",
  "Cake Topper":   "each",
  "Fridge Magnet": "each",
};

const FAQS = [
  {
    q: "What counts as a color?",
    a: "Each distinct filament counts as one color. Skin tone + one outfit = 2 colors (Duo). Add hair detail = 3 colors (Signature). Add accessories, shoes, or a pet = 4+ colors (Heirloom). We'll recommend the right tier after seeing your photos.",
  },
  {
    q: "Can I see examples of each tier?",
    a: "Yes! When you start your order and upload your photos, you can request a sample render for each tier before committing. We'll help you choose the best option for your style.",
  },
  {
    q: "Can I change my tier after ordering?",
    a: "You can upgrade your tier any time before design work begins — just email us at support@wedprint3d.com. Upgrading after the design starts may incur a redesign fee. Downgrading is not possible once work has started.",
  },
];

const fmt = formatCents;

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--wp-ivory)" }}>

      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
           style={{ borderColor: "var(--wp-border)" }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo width={180} href="/" />
          <Link href="/order/step1-style">
            <button className="btn-cta border-0 text-white text-sm font-semibold px-5 py-2 rounded-xl flex items-center gap-2">
              Start your order
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "var(--wp-charcoal)" }}>
          Simple, transparent pricing
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--wp-muted)" }}>
          Choose your color tier — more colors means more detail.
          Every order includes a 3D preview before we print.
        </p>
      </section>

      {/* Tier cards (mobile-first stacked, desktop side-by-side) */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TIERS.map((tier) => (
            <div key={tier.key}
                 className="rounded-2xl bg-white p-6 flex flex-col relative"
                 style={{ border: `2px solid ${tier.accent}22` }}>
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-3 py-1 rounded-full whitespace-nowrap"
                     style={{ background: "var(--wp-cta)" }}>
                  Most popular
                </div>
              )}

              {/* Color dots */}
              <div className="flex items-center gap-1.5 mb-3">
                {tier.dots.map((c, i) => (
                  <span key={i} className="w-5 h-5 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: c }} />
                ))}
                {tier.key === "HEIRLOOM" && (
                  <span className="text-sm font-bold" style={{ color: "var(--wp-muted)" }}>+</span>
                )}
              </div>

              <h3 className="text-xl font-bold mb-0.5" style={{ color: "var(--wp-charcoal)" }}>
                {tier.label}
              </h3>
              <p className="text-xs mb-1" style={{ color: "var(--wp-muted)" }}>{tier.tagline}</p>
              <p className="text-sm mb-4" style={{ color: "var(--wp-muted)" }}>{tier.description}</p>

              <div className="space-y-3 mb-6 flex-1">
                {PRODUCTS.map((product) => (
                  <div key={product} className="flex items-center justify-between text-sm">
                    <span style={{ color: "var(--wp-muted)" }}>{product}</span>
                    <span className="font-semibold" style={{ color: "var(--wp-charcoal)" }}>
                      {fmt(tier.prices[product])}
                      {product === "Guest Favours" && (
                        <span className="text-xs font-normal" style={{ color: "var(--wp-muted)" }}>/10</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/order/step1-style">
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background:   tier.popular ? "var(--wp-cta)" : "var(--wp-sage-light)",
                    color:        tier.popular ? "#fff" : "var(--wp-sage)",
                    border:       `1px solid ${tier.popular ? "var(--wp-cta)" : "var(--wp-sage)"}`,
                  }}
                >
                  Choose {tier.label}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table (desktop) */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: "var(--wp-charcoal)" }}>
          Full comparison
        </h2>
        <div className="rounded-2xl overflow-hidden border bg-white" style={{ borderColor: "var(--wp-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--wp-secondary-bg)" }}>
                <th className="text-left px-6 py-4 font-semibold" style={{ color: "var(--wp-charcoal)" }}>
                  Product
                </th>
                {TIERS.map((tier) => (
                  <th key={tier.key} className="text-center px-4 py-4">
                    <div className="font-bold" style={{ color: "var(--wp-charcoal)" }}>{tier.label}</div>
                    <div className="flex items-center justify-center gap-0.5 mt-1">
                      {tier.dots.map((c, i) => (
                        <span key={i} className="w-3 h-3 rounded-full inline-block"
                              style={{ backgroundColor: c }} />
                      ))}
                      {tier.key === "HEIRLOOM" && <span className="text-[10px]">+</span>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((product, i) => (
                <tr key={product}
                    style={{ background: i % 2 === 0 ? "#fff" : "var(--wp-secondary-bg)" }}>
                  <td className="px-6 py-4 font-medium" style={{ color: "var(--wp-charcoal)" }}>
                    {product}
                    {PRODUCT_NOTE[product] && (
                      <div className="text-xs font-normal" style={{ color: "var(--wp-muted)" }}>
                        {PRODUCT_NOTE[product]}
                      </div>
                    )}
                  </td>
                  {TIERS.map((tier) => (
                    <td key={tier.key} className="text-center px-4 py-4 font-semibold"
                        style={{ color: "var(--wp-charcoal)" }}>
                      {fmt(tier.prices[product])}
                      {product === "Guest Favours" && (
                        <span className="text-xs font-normal" style={{ color: "var(--wp-muted)" }}>/10</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Colors row */}
              <tr style={{ background: "var(--wp-sage-light)" }}>
                <td className="px-6 py-4 font-medium" style={{ color: "var(--wp-charcoal)" }}>
                  Filament colors
                </td>
                {TIERS.map((tier) => (
                  <td key={tier.key} className="text-center px-4 py-4 font-semibold"
                      style={{ color: "var(--wp-sage)" }}>
                    {tier.key === "HEIRLOOM" ? "4+" : tier.colors}
                  </td>
                ))}
              </tr>
              {/* Inclusions */}
              {["3D design preview", "Free revision rounds", "Design approval before printing"].map((feature, idx) => (
                <tr key={feature} style={{ background: idx % 2 === 0 ? "#fff" : "var(--wp-secondary-bg)" }}>
                  <td className="px-6 py-4 font-medium" style={{ color: "var(--wp-charcoal)" }}>
                    {feature}
                    {feature === "Free revision rounds" && (
                      <div className="text-xs font-normal" style={{ color: "var(--wp-muted)" }}>
                        Standard / Premium / Elite tier
                      </div>
                    )}
                  </td>
                  {TIERS.map((tier) => (
                    <td key={tier.key} className="text-center px-4 py-4">
                      {feature === "Free revision rounds" ? (
                        <span className="text-xs" style={{ color: "var(--wp-muted)" }}>1 / 3 / ∞</span>
                      ) : (
                        <Check className="h-4 w-4 mx-auto" style={{ color: "var(--wp-sage)" }} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: "var(--wp-charcoal)" }}>
          Frequently asked questions
        </h2>
        <div className="space-y-5">
          {FAQS.map((faq) => (
            <div key={faq.q} className="rounded-2xl bg-white p-6"
                 style={{ border: "1px solid var(--wp-border)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "var(--wp-charcoal)" }}>
                {faq.q}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--wp-muted)" }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-20 text-center">
        <div className="rounded-2xl p-10" style={{ background: "var(--wp-secondary-bg)", border: "1px solid var(--wp-border)" }}>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--wp-charcoal)" }}>
            Ready to create yours?
          </h2>
          <p className="mb-6" style={{ color: "var(--wp-muted)" }}>
            Choose your tier during the order process — takes about 5 minutes.
          </p>
          <Link href="/order/step1-style">
            <button className="btn-cta border-0 text-white font-semibold px-8 py-3.5 rounded-xl text-base flex items-center gap-2 mx-auto">
              Start your order
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t text-sm"
              style={{ borderColor: "var(--wp-border)", color: "var(--wp-muted)" }}>
        <Link href="/" className="hover:underline mr-4" style={{ color: "var(--wp-sage)" }}>← Home</Link>
        <Link href="/contact" className="hover:underline mr-4" style={{ color: "var(--wp-sage)" }}>Contact</Link>
        <Link href="/privacy" className="hover:underline mr-4" style={{ color: "var(--wp-sage)" }}>Privacy</Link>
        <Link href="/terms"   className="hover:underline"      style={{ color: "var(--wp-sage)" }}>Terms</Link>
        <p className="mt-3 text-xs" style={{ color: "var(--wp-muted)" }}>
          © {new Date().getFullYear()} WedPrint. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
