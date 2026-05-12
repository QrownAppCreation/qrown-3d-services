import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { db } from "@/lib/db";
import { Star, Clock, Shield, ArrowRight, Ruler } from "lucide-react";

export default async function HomePage() {
  const testimonialReviews = await db.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      {/* ── Hero — "Your Photos. Your Topper." process banner ──── */}
      <section className="overflow-hidden" style={{ background: "#FAFAF8" }}>
        <div className="max-w-[940px] mx-auto shadow-2xl" style={{ background: "#FAFAF8" }}>

          {/* Coral accent band */}
          <div className="h-[5px]" style={{ background: "linear-gradient(90deg,#E85D40 0%,#F2956A 40%,#E85D40 70%,#C04020 100%)" }} />

          {/* Header — headline left, topper image right */}
          <div className="grid grid-cols-[1fr_auto] items-end gap-5 px-8 sm:px-14 pt-10 pb-8 border-b" style={{ borderColor: "#E8E0D8" }}>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.5em] mb-3" style={{ color: "#E85D40", fontFamily: "var(--font-syne), sans-serif" }}>
                Custom Wedding Cake Toppers
              </p>
              <h1 className="text-4xl sm:text-[52px] font-extrabold leading-[0.95] tracking-tight" style={{ fontFamily: "var(--font-syne), sans-serif", color: "#111" }}>
                YOUR<br />PHOTOS.<br />
                <span style={{ color: "#E85D40" }}>YOUR</span><br />TOPPER.
              </h1>
              <p className="text-sm italic mt-3.5 leading-relaxed" style={{ fontFamily: "var(--font-newsreader), serif", color: "#777" }}>
                Three simple steps to a one-of-a-kind wedding keepsake,<br className="hidden sm:block" /> sculpted from your portraits.
              </p>
            </div>
            <div className="w-40 sm:w-60 flex-shrink-0 flex items-end justify-end">
              <Image
                src="/images/hero-topper-header.png"
                alt="Finished 3D printed cake topper"
                width={480}
                height={480}
                priority
                className="w-full h-auto max-h-[300px] object-contain object-bottom"
              />
            </div>
          </div>

          {/* Steps — 3 columns */}
          <div className="flex flex-col sm:flex-row gap-[2px]" style={{ background: "#E8E0D8" }}>

            {/* Step 1 — Send Portraits */}
            <div className="flex-1 flex flex-col p-6 sm:p-7" style={{ background: "#FAFAF8" }}>
              <div className="mb-4">
                <span className="text-[11px] tracking-[0.15em] block mb-1.5" style={{ fontFamily: "monospace", color: "#E85D40" }}>STEP_01</span>
                <div className="text-lg font-bold leading-tight" style={{ fontFamily: "var(--font-syne), sans-serif", color: "#111" }}>
                  Send Your<br />Portraits
                </div>
              </div>
              <div className="relative flex-1 min-h-[200px] flex gap-[2px] overflow-hidden" style={{ background: "#E8E4E0" }}>
                <div className="flex-1 overflow-hidden">
                  <Image src="/images/hero-groom-photo.jpg" alt="Groom reference photo" fill className="object-cover object-[center_15%]" sizes="15vw" />
                </div>
                <div className="flex-1 overflow-hidden relative">
                  <Image src="/images/hero-bride-photo.jpg" alt="Bride reference photo" fill className="object-cover object-[center_20%]" sizes="15vw" />
                </div>
                <span className="absolute bottom-2 left-2 z-10 text-[7px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 text-white" style={{ background: "#E85D40" }}>
                  Bride + Groom
                </span>
              </div>
              <p className="text-xs italic mt-3 leading-relaxed" style={{ fontFamily: "var(--font-newsreader), serif", color: "#888" }}>
                Share any clear photo of each person — we handle the rest.
              </p>
            </div>

            {/* Step 2 — 3D Model */}
            <div className="flex-1 flex flex-col p-6 sm:p-7" style={{ background: "#FAFAF8" }}>
              <div className="mb-4">
                <span className="text-[11px] tracking-[0.15em] block mb-1.5" style={{ fontFamily: "monospace", color: "#E85D40" }}>STEP_02</span>
                <div className="text-lg font-bold leading-tight" style={{ fontFamily: "var(--font-syne), sans-serif", color: "#111" }}>
                  We Craft<br />Your Model
                </div>
              </div>
              <div className="relative flex-1 min-h-[200px] overflow-hidden" style={{ background: "#F5F0EC" }}>
                <Image src="/images/hero-3d-render.png" alt="Custom 3D figurine render" fill className="object-contain object-center" sizes="30vw" />
                <span className="absolute bottom-2 left-2 z-10 text-[7px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 text-white" style={{ background: "#E85D40" }}>
                  3D Render
                </span>
              </div>
              <p className="text-xs italic mt-3 leading-relaxed" style={{ fontFamily: "var(--font-newsreader), serif", color: "#888" }}>
                Your likeness sculpted into a custom digital figurine for approval.
              </p>
            </div>

            {/* Step 3 — Final Print */}
            <div className="flex-1 flex flex-col p-6 sm:p-7" style={{ background: "#FAFAF8" }}>
              <div className="mb-4">
                <span className="text-[11px] tracking-[0.15em] block mb-1.5" style={{ fontFamily: "monospace", color: "#E85D40" }}>STEP_03</span>
                <div className="text-lg font-bold leading-tight" style={{ fontFamily: "var(--font-syne), sans-serif", color: "#111" }}>
                  Receive Your<br />Topper
                </div>
              </div>
              <div className="relative flex-1 min-h-[200px] overflow-hidden" style={{ background: "#F5F0EC" }}>
                <Image src="/images/hero-final-print.jpg" alt="Final 3D printed cake topper in hand" fill className="object-contain object-center" sizes="30vw" />
                <span className="absolute bottom-2 left-2 z-10 text-[7px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 text-white" style={{ background: "#E85D40" }}>
                  Final Print
                </span>
              </div>
              <p className="text-xs italic mt-3 leading-relaxed" style={{ fontFamily: "var(--font-newsreader), serif", color: "#888" }}>
                Precision-printed, hand-finished and shipped to your door.
              </p>
            </div>

          </div>

          {/* Info bar */}
          <div className="flex flex-wrap" style={{ background: "#111" }}>
            {[
              { icon: "✦", val: "100% Custom", label: "Every topper unique" },
              { icon: "◎", val: "Quick", label: "Turnaround" },
              { icon: "◈", val: "Any Pose", label: "You choose the style" },
              { icon: "⬡", val: "Ships Nationwide", label: "Handcrafted with love" },
            ].map((item) => (
              <div key={item.val} className="flex-1 min-w-[140px] flex items-center gap-3 px-5 py-4 border-r border-white/[0.06] last:border-r-0">
                <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: "rgba(232,93,64,0.15)" }}>
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ fontFamily: "var(--font-syne), sans-serif", color: "#FAFAF8" }}>{item.val}</div>
                  <div className="text-[9px] uppercase tracking-[0.2em] mt-0.5" style={{ color: "rgba(250,250,248,0.35)" }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-8 sm:px-14 py-4 border-t" style={{ background: "#FAFAF8", borderColor: "#E8E0D8" }}>
            <div className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-syne), sans-serif", color: "#111" }}>
              WED<span style={{ color: "#E85D40" }}>PRINT</span>3D
            </div>
            <div className="text-[11px] font-mono tracking-wider" style={{ color: "#E85D40" }}>
              wedprint3d.com
            </div>
          </div>

        </div>

        {/* CTA buttons below hero */}
        <div className="py-8 px-4 text-center" style={{ background: "#FAFAF8" }}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order/step1-style">
              <Button size="lg" className="btn-cta gap-2 text-base px-8 border-0 hover:opacity-90 shadow-lg">
                Start your order
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/gallery">
              <Button variant="outline" size="lg"
                className="text-base px-8 bg-white border hover:bg-gray-50"
                style={{ color: "var(--wp-charcoal)", borderColor: "var(--wp-border)" }}>
                See examples
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────────── */}
      <section className="border-y py-5 px-4"
               style={{ background: "var(--wp-sage-light)", borderColor: "var(--wp-border)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <Clock className="h-5 w-5" style={{ color: "var(--wp-sage)" }} />
              <p className="font-semibold text-sm" style={{ color: "var(--wp-charcoal)" }}>5–7 day turnaround</p>
              <p className="text-xs" style={{ color: "var(--wp-muted)" }}>Rush in 72 hrs</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Star className="h-5 w-5" style={{ color: "var(--wp-gold)" }} />
              <p className="font-semibold text-sm" style={{ color: "var(--wp-charcoal)" }}>You approve first</p>
              <p className="text-xs" style={{ color: "var(--wp-muted)" }}>3D preview before printing</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Shield className="h-5 w-5" style={{ color: "var(--wp-cta)" }} />
              <p className="font-semibold text-sm" style={{ color: "var(--wp-charcoal)" }}>Satisfaction guaranteed</p>
              <p className="text-xs" style={{ color: "var(--wp-muted)" }}>We revise until you love it</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3" style={{ color: "var(--wp-charcoal)" }}>What we create</h2>
          <p className="text-center mb-12" style={{ color: "var(--wp-muted)" }}>
            Every piece is custom-designed from your photos, then 3D printed to order.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.map((product) => (
              <div
                key={product.name}
                className="rounded-2xl p-6 transition-all border border-[#E8E5DF] hover:border-[#8B9D77] hover:shadow-md"
              >
                <div className="text-3xl mb-3">{product.icon}</div>
                <h3 className="font-semibold text-lg mb-1" style={{ color: "var(--wp-charcoal)" }}>{product.name}</h3>
                <p className="text-sm mb-3" style={{ color: "var(--wp-muted)" }}>{product.description}</p>
                <p className="font-bold text-sm" style={{ color: "var(--wp-cta)" }}>{product.price}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Ruler className="h-3 w-3" style={{ color: "var(--wp-sage)" }} />
                  <p className="text-xs" style={{ color: "var(--wp-muted)" }}>{product.size}</p>
                </div>
                {product.note && (
                  <p className="text-xs mt-1 font-medium" style={{ color: "var(--wp-sage)" }}>{product.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery (Our Work) ────────────────────────────────────── */}
      {/* Replace these with real product photos once available */}
      <section id="gallery" className="py-20 px-4" style={{ background: "var(--wp-secondary-bg)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--wp-charcoal)" }}>
              Crafted with love, printed with precision
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "var(--wp-muted)" }}>
              Every piece is unique — made from your photos
            </p>
          </div>

          {/* 3-column responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {GALLERY.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden bg-muted shadow-sm"
                style={{ aspectRatio: item.tall ? "3/4" : "1/1" }}
              >
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-5
                                translate-y-3 group-hover:translate-y-0
                                opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white font-semibold text-sm">{item.caption}</p>
                  <p className="text-white/70 text-xs mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/order/step1-style">
              <Button size="lg" className="btn-cta gap-2 text-base px-8 border-0 hover:opacity-90">
                Create yours
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <TestimonialsSection reviews={testimonialReviews} />

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--wp-charcoal)" }}>
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 text-white shadow-md"
                  style={{ backgroundColor: "var(--wp-sage)" }}
                >
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--wp-charcoal)" }}>{step.title}</h3>
                <p className="text-sm" style={{ color: "var(--wp-muted)" }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ──────────────────────────────────────────────── */}
      <section className="wedding-gradient py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4" style={{ color: "var(--wp-charcoal)" }}>
            Ready to create something beautiful?
          </h2>
          <p className="mb-8 text-lg" style={{ color: "var(--wp-muted)" }}>
            It only takes 5 minutes to place your order.
          </p>
          <Link href="/order/step1-style">
            <Button size="lg" className="btn-cta gap-2 text-base px-10 border-0 hover:opacity-90 shadow-lg">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: "var(--wp-charcoal)" }}>
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1 space-y-4">
              <Logo width={176} variant="onDark" />
              <p className="text-white/50 text-sm leading-relaxed">
                Custom 3D printed wedding keepsakes, handcrafted from your photos.
                Serving the Miami area.
              </p>
              {/* Social placeholders */}
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
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick links</h4>
              <ul className="space-y-2.5">
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
                    <Link href={l.href} className="text-white/50 text-sm hover:text-white/90 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Products</h4>
              <ul className="space-y-2.5">
                {[
                  "Cake Toppers",
                  "Bridal Party Gifts",
                  "Guest Favours",
                  "Fridge Magnets",
                ].map((p) => (
                  <li key={p}>
                    <Link href="/order/step1-style" className="text-white/50 text-sm hover:text-white/90 transition-colors">
                      {p}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Support</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="mailto:support@wedprint3d.com"
                     className="text-white/50 text-sm hover:text-white/90 transition-colors">
                    support@wedprint3d.com
                  </a>
                </li>
                <li><Link href="/contact"  className="text-white/50 text-sm hover:text-white/90 transition-colors">Contact form</Link></li>
                <li><Link href="/privacy"  className="text-white/50 text-sm hover:text-white/90 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms"    className="text-white/50 text-sm hover:text-white/90 transition-colors">Terms of Service</Link></li>
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

const PRODUCTS = [
  {
    icon: "🎂",
    name: "Cake Toppers",
    description: "Custom miniature figures of you and your partner, crafted from your photos.",
    price: "From $79 to $154",
    size: "100–180mm tall",
    note: "1 to 4+ colors",
  },
  {
    icon: "💝",
    name: "Bridal Party Gifts",
    description: "Personalised keepsakes for your bridesmaids, groomsmen, and flower girls.",
    price: "From $49 to $95",
    size: "80–150mm tall",
    note: "per piece · 1 to 4+ colors",
  },
  {
    icon: "🎁",
    name: "Guest Favours",
    description: "Miniature custom prints your guests will treasure long after the big day.",
    price: "From $85 to $165",
    size: "40–80mm tall",
    note: "per 10 pieces · min 10",
  },
  {
    icon: "🧲",
    name: "Fridge Magnets",
    description: "Beautiful relief portraits of you two — a daily reminder of your special day.",
    price: "From $18 to $38",
    size: "40–70mm wide · flat relief",
    note: "1 to 4+ colors",
  },
];

// Replace these with real product photos once available
const GALLERY = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80&fit=crop",
    caption: "Elegant Cake Topper",
    sub: "Romantic tier · PLA matte white",
    tall: false,
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80&fit=crop&crop=faces",
    caption: "Classic Couple",
    sub: "Elegant tier · hand-painted finish",
    tall: false,
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80&fit=crop",
    caption: "Fun & Playful",
    sub: "Fun tier · bright painted details",
    tall: false,
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80&fit=crop",
    caption: "Bridal Party Set",
    sub: "6-piece bridesmaid gift set",
    tall: false,
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&q=80&fit=crop",
    caption: "Adventurous Theme",
    sub: "Hiking pose · custom props",
    tall: false,
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80&fit=crop",
    caption: "Guest Favours",
    sub: "Set of 20 · 50mm relief portraits",
    tall: false,
  },
];

const STEPS = [
  {
    title: "Choose your style",
    description: "Pick an aesthetic — fun and playful, elegant and formal, romantic, or adventurous.",
  },
  {
    title: "Upload your photos",
    description: "Share clear photos of yourselves plus any outfit or inspiration references.",
  },
  {
    title: "Approve and print",
    description: "We design your piece, you approve the 3D preview, then we print and deliver.",
  },
];
