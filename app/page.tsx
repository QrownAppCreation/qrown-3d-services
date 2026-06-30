// START CHANGE — force dynamic rendering so Next.js never prerenders this page
// at build time. The homepage fetches from Supabase via PrismaPg which is only
// available at request time, not during Vercel's build step. (June 30 2026)
export const dynamic = "force-dynamic";
// END CHANGE

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { db } from "@/lib/db";
import {
  Star,
  Clock,
  Shield,
  ArrowRight,
  Camera,
  Palette,
  Ruler,
  CreditCard,
  Heart,
  CheckCircle2,
} from "lucide-react";

export default async function HomePage() {
  // START CHANGE — wrap DB call in try/catch so Vercel build doesn't fail
  // if Supabase is unreachable during prerender (June 30 2026)
  let testimonialReviews: Awaited<ReturnType<typeof db.review.findMany>> = [];
  try {
    testimonialReviews = await db.review.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch (err) {
    console.warn("DB unavailable during build — testimonials will be empty:", err);
  }
  // END CHANGE

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════
          HERO — Mobile-first, bold headline with product image
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: "var(--wp-ivory)" }}>
        {/* Subtle sage gradient background */}
        <div className="absolute inset-0 wedding-gradient opacity-60" />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-10 sm:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

            {/* Left — Copy + CTA */}
            <div className="text-center md:text-left order-2 md:order-1">
              <p
                className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] mb-3 sm:mb-4"
                style={{ color: "var(--wp-sage)", fontFamily: "var(--font-syne), sans-serif" }}
              >
                Custom 3D Printed Cake Toppers
              </p>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight mb-4 sm:mb-6"
                style={{ fontFamily: "var(--font-syne), sans-serif", color: "var(--wp-charcoal)" }}
              >
                Your love story,{" "}
                <span style={{ color: "var(--wp-cta)" }}>perfectly printed.</span>
              </h1>
              <p
                className="text-base sm:text-lg leading-relaxed mb-8 max-w-lg mx-auto md:mx-0"
                style={{ color: "var(--wp-muted)", fontFamily: "var(--font-newsreader), serif" }}
              >
                Send us your photos, pick your colors and size — we sculpt a
                one-of-a-kind miniature of you two, 3D printed and delivered to your door.
              </p>

              {/* Primary CTA — large, thumb-friendly */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link href="#quick-order">
                  <Button
                    size="lg"
                    className="btn-cta gap-2 text-base sm:text-lg px-10 py-6 border-0 hover:opacity-90 shadow-lg w-full sm:w-auto"
                  >
                    Start Your Order
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base px-8 py-6 bg-white/80 border hover:bg-white w-full sm:w-auto"
                    style={{ color: "var(--wp-charcoal)", borderColor: "var(--wp-border)" }}
                  >
                    See examples
                  </Button>
                </Link>
              </div>

              {/* Quick trust badges inline */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 justify-center md:justify-start">
                {[
                  { icon: <Clock className="h-3.5 w-3.5" />, text: "5–7 day turnaround" },
                  { icon: <Star className="h-3.5 w-3.5" />, text: "You approve first" },
                  { icon: <Shield className="h-3.5 w-3.5" />, text: "Satisfaction guaranteed" },
                ].map((b) => (
                  <span key={b.text} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--wp-muted)" }}>
                    <span style={{ color: "var(--wp-sage)" }}>{b.icon}</span>
                    {b.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Hero product image */}
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative w-64 sm:w-80 md:w-full max-w-[420px]">
                <Image
                  src="/images/hero-topper-header.png"
                  alt="Custom 3D printed wedding cake topper"
                  width={480}
                  height={480}
                  priority
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS — 3-step process with real product photos
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-5 sm:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mb-3"
            style={{ color: "var(--wp-charcoal)" }}
          >
            Three simple steps
          </h2>
          <p className="text-center mb-10 sm:mb-14 text-sm sm:text-base" style={{ color: "var(--wp-muted)" }}>
            From your favourite photo to a keepsake that lasts forever
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.label} className="text-center">
                {/* Step image — split bride+groom view for step 1, single image for steps 2 & 3 */}
                <div className="relative mx-auto w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden mb-5 shadow-md">
                  {step.groomImage ? (
                    /* Split view: bride left, groom right — shows both photos are needed */
                    <div className="flex h-full w-full">
                      <div className="relative w-1/2 h-full">
                        <Image
                          src={step.image}
                          alt={step.alt}
                          fill
                          className="object-cover object-center"
                          sizes="14vw"
                        />
                      </div>
                      {/* Divider */}
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/70 z-10" />
                      <div className="relative w-1/2 h-full">
                        <Image
                          src={step.groomImage}
                          alt={step.groomAlt ?? "Groom reference photo"}
                          fill
                          className="object-cover object-center"
                          sizes="14vw"
                        />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={step.image}
                      alt={step.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 80vw, 28vw"
                    />
                  )}
                  {/* Step number badge */}
                  <div
                    className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md z-20"
                    style={{ backgroundColor: "var(--wp-sage)" }}
                  >
                    {i + 1}
                  </div>
                </div>
                <h3
                  className="font-semibold text-lg mb-1.5"
                  style={{ color: "var(--wp-charcoal)", fontFamily: "var(--font-syne), sans-serif" }}
                >
                  {step.label}
                </h3>
                <p className="text-sm leading-relaxed max-w-[260px] mx-auto" style={{ color: "var(--wp-muted)" }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          QUICK ORDER — Simplified path (upload → colors → size → pay)
          ══════════════════════════════════════════════════════════════ */}
      <section
        id="quick-order"
        className="py-16 sm:py-20 px-5 sm:px-8 scroll-mt-20"
        style={{ background: "var(--wp-secondary-bg)" }}
      >
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mb-3"
            style={{ color: "var(--wp-charcoal)" }}
          >
            Ready? It only takes a few minutes.
          </h2>
          <p className="text-center mb-10 text-sm sm:text-base" style={{ color: "var(--wp-muted)" }}>
            Upload your photos, make a few choices, and we take it from there.
          </p>

          {/* Simplified steps as cards */}
          <div className="space-y-4">
            {QUICK_STEPS.map((step, i) => (
              <div
                key={step.title}
                className="flex items-start gap-4 sm:gap-5 bg-white rounded-xl p-5 sm:p-6 border shadow-sm"
                style={{ borderColor: "var(--wp-border)" }}
              >
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--wp-sage-light)", color: "var(--wp-sage)" }}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--wp-sage)" }}>
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg" style={{ color: "var(--wp-charcoal)" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: "var(--wp-muted)" }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA + escape hatch */}
          <div className="mt-8 text-center">
            <Link href="/order/step1-style">
              <Button
                size="lg"
                className="btn-cta gap-2 text-base sm:text-lg px-10 py-6 border-0 hover:opacity-90 shadow-lg w-full sm:w-auto"
              >
                Start Your Order
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <p className="text-xs mt-4" style={{ color: "var(--wp-muted)" }}>
              Starting at <strong style={{ color: "var(--wp-charcoal)" }}>$79</strong> · 50% deposit today, rest on approval
            </p>
            <Link
              href="/order/step1-style"
              className="inline-block text-xs mt-2 underline underline-offset-2 hover:opacity-80 transition-opacity"
              style={{ color: "var(--wp-sage)" }}
            >
              Want more options? Try our full customiser →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          GALLERY — Real product photos (3 couples)
          ══════════════════════════════════════════════════════════════ */}
      <section id="gallery" className="py-16 sm:py-20 px-5 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "var(--wp-charcoal)" }}>
              Crafted with love, printed with precision
            </h2>
            <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: "var(--wp-muted)" }}>
              Every piece is unique — designed from your photos, sculpted in 3D, printed to perfection
            </p>
          </div>

          {/* Real product gallery using all 3 couples */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            {GALLERY.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-muted shadow-sm"
                style={{ aspectRatio: "1/1" }}
              >
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5
                                translate-y-2 group-hover:translate-y-0
                                opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white font-semibold text-xs sm:text-sm">{item.caption}</p>
                  <p className="text-white/70 text-[10px] sm:text-xs mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/gallery">
              <Button variant="outline" size="lg" className="px-8">
                View full gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PRODUCTS — What we create
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-5 sm:px-8" style={{ background: "var(--wp-secondary-bg)" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3" style={{ color: "var(--wp-charcoal)" }}>
            What we create
          </h2>
          <p className="text-center mb-10 sm:mb-12 text-sm sm:text-base" style={{ color: "var(--wp-muted)" }}>
            Every piece is custom-designed from your photos, then 3D printed to order.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {PRODUCTS.map((product) => (
              <div
                key={product.name}
                className="rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all border bg-white hover:border-[var(--wp-sage)] hover:shadow-md"
                style={{ borderColor: "var(--wp-border)" }}
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{product.icon}</div>
                <h3 className="font-semibold text-sm sm:text-lg mb-1" style={{ color: "var(--wp-charcoal)" }}>
                  {product.name}
                </h3>
                <p className="text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed" style={{ color: "var(--wp-muted)" }}>
                  {product.description}
                </p>
                <p className="font-bold text-xs sm:text-sm" style={{ color: "var(--wp-cta)" }}>
                  {product.price}
                </p>
                {product.note && (
                  <p className="text-[10px] sm:text-xs mt-1 font-medium" style={{ color: "var(--wp-sage)" }}>
                    {product.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <TestimonialsSection reviews={testimonialReviews} />

      {/* ══════════════════════════════════════════════════════════════
          SCROLL-PAST REMINDER — Warm, reassuring "Still thinking?"
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-5 sm:px-8" style={{ background: "var(--wp-ivory)" }}>
        <div className="max-w-3xl mx-auto text-center">
          {/* Warm headline */}
          <Heart className="h-8 w-8 mx-auto mb-4" style={{ color: "var(--wp-cta)", opacity: 0.7 }} />
          <h2
            className="text-2xl sm:text-3xl font-bold mb-4"
            style={{ color: "var(--wp-charcoal)" }}
          >
            Still thinking it over?
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ color: "var(--wp-muted)", fontFamily: "var(--font-newsreader), serif" }}
          >
            No rush at all. Here are a few things couples tell us made the
            decision easy:
          </p>

          {/* Reassurance points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-left sm:text-center">
            {REASSURANCE.map((item) => (
              <div key={item.title} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 sm:mt-0" style={{ color: "var(--wp-sage)" }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--wp-charcoal)" }}>
                    {item.title}
                  </p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--wp-muted)" }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Gentle CTA */}
          <Link href="/order/step1-style">
            <Button
              size="lg"
              className="btn-cta gap-2 text-base px-10 py-6 border-0 hover:opacity-90 shadow-lg"
            >
              Start whenever you&apos;re ready
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-xs mt-4" style={{ color: "var(--wp-muted)" }}>
            Questions? <Link href="/contact" className="underline underline-offset-2 hover:opacity-80" style={{ color: "var(--wp-sage)" }}>Chat with us</Link> — we&apos;re happy to help.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════════════ */}
      <footer style={{ backgroundColor: "var(--wp-charcoal)" }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-12 sm:pt-14 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <Logo width={160} variant="onDark" />
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
                Custom 3D printed wedding keepsakes, handcrafted from your photos.
                Serving the Miami area.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { label: "Instagram", href: "https://instagram.com/wedprint3d", icon: "📸" },
                  { label: "Facebook",  href: "https://facebook.com/wedprint3d",  icon: "📘" },
                  { label: "TikTok",    href: "https://tiktok.com/@wedprint3d",   icon: "🎵" },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                     title={s.label}
                     className="w-9 h-9 rounded-full flex items-center justify-center text-sm bg-white/10 hover:bg-white/20 transition-colors">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white font-semibold text-xs sm:text-sm mb-3 sm:mb-4 uppercase tracking-wider">Quick links</h4>
              <ul className="space-y-2">
                {[
                  { label: "Home",              href: "/" },
                  { label: "Gallery",           href: "/gallery" },
                  { label: "Pricing",           href: "/pricing" },
                  { label: "Reviews",           href: "/reviews" },
                  { label: "Share your moment", href: "/share-your-moment" },
                  { label: "Start your order",  href: "/order/step1-style" },
                  { label: "Track my order",    href: "/track-order" },
                  { label: "Contact us",        href: "/contact" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-white/50 text-xs sm:text-sm hover:text-white/90 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-white font-semibold text-xs sm:text-sm mb-3 sm:mb-4 uppercase tracking-wider">Products</h4>
              <ul className="space-y-2">
                {[
                  "Cake Toppers",
                  "Bridal Party Gifts",
                  "Guest Favours",
                  "Fridge Magnets",
                ].map((p) => (
                  <li key={p}>
                    <Link href="/order/step1-style" className="text-white/50 text-xs sm:text-sm hover:text-white/90 transition-colors">
                      {p}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold text-xs sm:text-sm mb-3 sm:mb-4 uppercase tracking-wider">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:support@wedprint3d.com"
                     className="text-white/50 text-xs sm:text-sm hover:text-white/90 transition-colors">
                    support@wedprint3d.com
                  </a>
                </li>
                <li><Link href="/contact"  className="text-white/50 text-xs sm:text-sm hover:text-white/90 transition-colors">Contact form</Link></li>
                <li><Link href="/privacy"  className="text-white/50 text-xs sm:text-sm hover:text-white/90 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms"    className="text-white/50 text-xs sm:text-sm hover:text-white/90 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
               style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-white/30 text-xs">
              © {new Date().getFullYear()} WedPrint. All rights reserved. · wedprint3d.com
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-white/30 text-xs hover:text-white/60 transition-colors">Privacy</Link>
              <Link href="/terms"   className="text-white/30 text-xs hover:text-white/60 transition-colors">Terms</Link>
              <Link href="/operator/login" className="text-white/20 text-xs hover:text-white/50 transition-colors">Operator</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────

/** 3-step process showcase — couple 2's full journey for consistency */
const PROCESS_STEPS = [
  {
    label: "Send your photos",
    description: "One clear photo of each of you — any pose, any outfit. We handle the rest.",
    image: "/images/couple2-Bride.jpeg",
    alt: "Couple 2 bride reference photo used to create a custom cake topper",
    // groomImage shows a split bride/groom view to communicate that BOTH photos are needed
    groomImage: "/images/couple2-bride-groom.jpeg",
    groomAlt: "Couple 2 groom reference photo used to create a custom cake topper",
  },
  {
    label: "We sculpt your model",
    description: "Our artists create a custom 3D model of you two. You approve before we print.",
    image: "/images/couple2-render.JPG",
    alt: "Custom 3D render of couple 2 as a wedding cake topper figurine",
  },
  {
    label: "Receive your topper",
    description: "Precision-printed, hand-finished, and shipped to your door in 5–7 days.",
    image: "/images/couple2-final-print.png",
    alt: "Finished 3D printed cake topper of couple 2 held in hand",
  },
];

/** Simplified order funnel steps */
const QUICK_STEPS = [
  {
    icon: <Camera className="h-5 w-5" />,
    title: "Upload your photos",
    description: "One clear photo of each of you — face visible, any angle. That's all we need to get started.",
  },
  {
    icon: <Palette className="h-5 w-5" />,
    title: "Pick your colors",
    description: "Choose 1-color (clean and classic) or 2-color (skin tones + outfit). Want full detail? We have more options.",
  },
  {
    icon: <Ruler className="h-5 w-5" />,
    title: "Choose your size",
    description: "Small (~4\"), Standard (~5.5\"), or Large (~7\"). Think coffee mug, soda can, or wine bottle — that's the height range.",
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: "Pay 50% deposit",
    description: "Just half upfront. You'll see a 3D preview before we print — pay the rest only when you're happy.",
  },
];

/** Gallery — one unique shot per couple; Couple 5 shown in both poses (seated + walking) */
const GALLERY = [
  {
    id: 1,
    src: "/images/hero-topper-header.png",
    caption: "Classic Couple",
    sub: "Couple 1 · standard size · product shot",
  },
  {
    id: 2,
    src: "/images/couple2-render.JPG",
    caption: "Walking Together",
    sub: "Couple 2 · 3D render · walking pose",
  },
  {
    id: 3,
    src: "/images/couple3-final-print.png",
    caption: "The Proposal",
    sub: "Couple 3 · final print · kneeling pose",
  },
  {
    id: 4,
    src: "/images/Couple4/couple4-product-shot.png",
    caption: "Bold & Confident",
    sub: "Couple 4 · product shot · arms crossed pose",
  },
  {
    id: 5,
    src: "/images/Couple5/couple5-product-shot1.png",
    caption: "Casually in Love",
    sub: "Couple 5 · seated pose · product shot",
  },
  {
    id: 6,
    src: "/images/Couple5/couple5-product-shot-2.png",
    caption: "Walking into Forever",
    sub: "Couple 5 · walking pose · hand-held",
  },
];

/** Scroll-past reassurance points */
const REASSURANCE = [
  {
    title: "You approve everything first",
    description: "We send you a 3D preview before printing. Not happy? We revise until you love it — at no extra cost.",
  },
  {
    title: "It's more affordable than you think",
    description: "Starting at $79 with a 50% deposit. The rest isn't due until you've approved your preview.",
  },
  {
    title: "Most couples wish they'd ordered sooner",
    description: "Our toppers make the cake table the highlight of the reception. And the photos? Priceless.",
  },
];

const PRODUCTS = [
  {
    icon: "🎂",
    name: "Cake Toppers",
    description: "Custom miniatures of you and your partner, crafted from your photos.",
    price: "From $79",
    note: "1 to 4+ colors",
  },
  {
    icon: "💝",
    name: "Bridal Party Gifts",
    description: "Personalised keepsakes for your bridesmaids and groomsmen.",
    price: "From $49",
    note: "Coming soon",
  },
  {
    icon: "🎁",
    name: "Guest Favours",
    description: "Miniature prints your guests will treasure long after the big day.",
    price: "From $85/10pc",
    note: "Coming soon",
  },
  {
    icon: "🧲",
    name: "Fridge Magnets",
    description: "Relief portraits of you two — a daily reminder of your day.",
    price: "From $18",
    note: "Coming soon",
  },
];
