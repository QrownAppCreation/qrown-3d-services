"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/start/page.tsx
// High-conversion landing page — destination for business card QR codes.
// One job: remove every fear, show the value, capture the lead or the order.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  CheckCircle2,
  ArrowRight,
  Star,
  MessageCircle,
  Shield,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ── TESTIMONIALS (replace with real reviews when available) ───────────────────
const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah & Marcus",
    location: "Miami, FL",
    quote:
      "We were nervous sending in casual photos but the topper looked exactly like us. Our guests couldn't stop talking about it. Worth every penny.",
    rating: 5,
    image: "/images/hero-topper-header.png",
  },
  {
    id: 2,
    name: "Priya & James",
    location: "New York, NY",
    quote:
      "The approval step made all the difference. We got to see our render and request one small tweak before it printed. Perfect result.",
    rating: 5,
    image: "/images/Couple4/couple4-product-shot.png",
  },
  {
    id: 3,
    name: "Leila & David",
    location: "Atlanta, GA",
    quote:
      "Ordered 10 days before the wedding — arrived in 6 days with time to spare. Absolutely beautiful. Already have it displayed in our home.",
    rating: 5,
    image: "/images/Couple5/couple5-product-shot-2.png",
  },
];

// ── FAQ DATA ──────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "What kind of photos do you need?",
    a: "One clear photo of each of you — any outfit, any setting, any background. Casual selfies work perfectly. We've built toppers from beach photos, graduation shots, and even blurry group pictures cropped to the face.",
  },
  {
    q: "What if it doesn't look like us?",
    a: "That's why we built the approval step. Before we print a single layer, you'll receive a 3D digital render of your topper. If anything needs adjusting — hair, skin tone, clothing — we revise it. We don't print until you say yes.",
  },
  {
    q: "How long does it take?",
    a: "5–7 business days from the moment you approve your render. We recommend ordering at least 3 weeks before your wedding date to keep things stress-free.",
  },
  {
    q: "How much does it cost?",
    a: "Our 1-Color Classic starts at $79. Full-color Classic starts at $99. Our premium Heirloom finish starts at $149. A 50% deposit is due today — the remainder is collected only after you approve your design.",
  },
  {
    q: "Do you ship outside of Miami?",
    a: "Yes — we ship nationwide and internationally. All orders are carefully packaged and fully insured.",
  },
];

// ── WHATSAPP CONFIG ───────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "19546628622"; // +1 954-662-8622 — no dashes or spaces
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi! I saw your business card and I'm interested in a custom wedding cake topper. Can you tell me more?"
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

// ─────────────────────────────────────────────────────────────────────────────

export default function StartPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    weddingDate: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire to your email/CRM — for now shows success state
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--wp-ivory)" }}>

      {/* ── MINIMAL HEADER ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b" style={{ borderColor: "var(--wp-border)" }}>
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between">
          <Logo />
          {/* WhatsApp CTA in header */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full text-white"
            style={{ backgroundColor: "#25D366" }}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Chat with us</span>
            <span className="sm:hidden">Chat</span>
          </a>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 pt-10 sm:pt-16 pb-10 text-center">

        {/* Trust pill */}
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
          style={{ background: "var(--wp-sage)", color: "white" }}
        >
          <Shield className="h-3 w-3" />
          You approve before we print — guaranteed
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight mb-4"
          style={{ fontFamily: "var(--font-syne), sans-serif", color: "var(--wp-charcoal)" }}
        >
          Your faces.{" "}
          <span style={{ color: "var(--wp-cta)" }}>Your story.</span>
          <br />
          Printed in 3D.
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg sm:text-xl leading-relaxed mb-4 max-w-2xl mx-auto"
          style={{ color: "var(--wp-muted)", fontFamily: "var(--font-newsreader), serif" }}
        >
          Custom wedding cake toppers sculpted from your real photos.
          No generic molds. No stock poses. Just the two of you.
        </p>

        {/* Price anchor — visible immediately */}
        <p
          className="text-base font-semibold mb-8"
          style={{ color: "var(--wp-gold)" }}
        >
          Starting at $79 · Ships in 5–7 days · 50% deposit today
        </p>

        {/* Hero product image */}
        <div className="relative mx-auto mb-8 rounded-3xl overflow-hidden shadow-2xl max-w-sm">
          <Image
            src="/images/Couple5/couple5-product-shot-2.png"
            alt="Custom 3D-printed wedding cake topper — couple walking pose, held in hand"
            width={600}
            height={800}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* Trust badges row */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-10 text-sm font-medium" style={{ color: "var(--wp-charcoal)" }}>
          {[
            { icon: Shield, text: "You approve first" },
            { icon: Clock, text: "Ships in 5–7 days" },
            { icon: RefreshCw, text: "Free revisions" },
            { icon: CheckCircle2, text: "Satisfaction guaranteed" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon className="h-4 w-4" style={{ color: "var(--wp-sage)" }} />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <Link href="/order/step1-style">
          <Button
            size="lg"
            className="btn-cta gap-2 text-lg px-12 py-7 border-0 hover:opacity-90 shadow-xl w-full sm:w-auto"
          >
            Start My Custom Topper
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <p className="text-xs mt-3" style={{ color: "var(--wp-muted)" }}>
          Takes 3 minutes · No commitment until you approve your design
        </p>
      </section>

      {/* ── STAR RATING BAR ──────────────────────────────────────────────── */}
      <div className="border-y py-4" style={{ borderColor: "var(--wp-border)", background: "white" }}>
        <div className="max-w-4xl mx-auto px-5 flex flex-wrap items-center justify-center gap-2 text-sm">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-4 w-4 fill-current" style={{ color: "var(--wp-gold)" }} />
            ))}
          </div>
          <span className="font-semibold" style={{ color: "var(--wp-charcoal)" }}>5.0</span>
          <span style={{ color: "var(--wp-muted)" }}>· Loved by couples in Miami and beyond</span>
        </div>
      </div>

      {/* ── BEFORE / AFTER ───────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--wp-sage)" }}>
            Any photo works
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ fontFamily: "var(--font-syne), sans-serif", color: "var(--wp-charcoal)" }}
          >
            From your photo to a keepsake
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "var(--wp-muted)", fontFamily: "var(--font-newsreader), serif" }}>
            No professional shoot needed. Send us whatever you have — we do the rest.
          </p>
        </div>

        {/* Before / After grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Before — reference photos */}
          <div className="space-y-3">
            <p className="text-center text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--wp-muted)" }}>
              Your photos
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl overflow-hidden aspect-square bg-muted">
                <Image
                  src="/images/couple2-Bride.jpeg"
                  alt="Bride reference photo used to create wedding cake topper"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square bg-muted">
                <Image
                  src="/images/couple2-bride-groom.jpeg"
                  alt="Groom reference photo used to create wedding cake topper"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <p className="text-center text-xs italic" style={{ color: "var(--wp-muted)" }}>
              Casual everyday photos — that&apos;s all we need
            </p>
          </div>

          {/* Arrow */}
          <div className="flex justify-center items-center py-4 sm:py-0">
            <div
              className="flex flex-col items-center gap-2 text-sm font-semibold"
              style={{ color: "var(--wp-sage)" }}
            >
              <ArrowRight className="h-8 w-8 rotate-90 sm:rotate-0" />
              <span className="text-xs text-center">We sculpt &amp; you approve</span>
            </div>
          </div>

          {/* After — finished topper */}
          <div className="space-y-3">
            <p className="text-center text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--wp-muted)" }}>
              Your topper
            </p>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/couple2-final-print.png"
                alt="Finished custom 3D-printed wedding cake topper from reference photos"
                width={400}
                height={400}
                className="w-full h-auto"
              />
            </div>
            <p className="text-center text-xs italic" style={{ color: "var(--wp-muted)" }}>
              Printed, finished &amp; shipped to your door
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-14" style={{ background: "white" }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-syne), sans-serif", color: "var(--wp-charcoal)" }}
            >
              Three simple steps
            </h2>
            <p className="text-base" style={{ color: "var(--wp-muted)", fontFamily: "var(--font-newsreader), serif" }}>
              From photos to your door in 5–7 days.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Send your photos",
                desc: "One photo of each of you. Any pose, any outfit. Upload takes 2 minutes.",
                image: "/images/couple2-Bride.jpeg",
              },
              {
                step: "02",
                title: "Approve your render",
                desc: "We send you a 3D digital preview. You say yes — or we revise it. No charge.",
                image: "/images/couple2-render.JPG",
              },
              {
                step: "03",
                title: "Receive your topper",
                desc: "Printed, hand-finished, and shipped in 5–7 days. Ready for your big day.",
                image: "/images/couple2-final-print.png",
              },
            ].map(({ step, title, desc, image }) => (
              <div key={step} className="text-center">
                <div className="relative mx-auto mb-4 w-28 h-28 rounded-2xl overflow-hidden shadow-md">
                  <Image src={image} alt={title} fill className="object-cover" sizes="112px" />
                  {/* Step badge */}
                  <div
                    className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: "var(--wp-sage)" }}
                  >
                    {step}
                  </div>
                </div>
                <h3 className="font-bold text-base mb-1" style={{ color: "var(--wp-charcoal)" }}>
                  {title}
                </h3>
                <p className="text-sm" style={{ color: "var(--wp-muted)" }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Prominent approval guarantee */}
          <div
            className="mt-10 rounded-2xl p-6 text-center border"
            style={{ background: "var(--wp-ivory)", borderColor: "var(--wp-border)" }}
          >
            <Shield className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--wp-sage)" }} />
            <p className="font-bold text-lg mb-1" style={{ color: "var(--wp-charcoal)", fontFamily: "var(--font-syne), sans-serif" }}>
              You approve everything before we print.
            </p>
            <p className="text-sm" style={{ color: "var(--wp-muted)" }}>
              If your render isn&apos;t right, we revise it — free, with no questions asked.
              We don&apos;t print until you love what you see.
            </p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--wp-sage)" }}>
            Happy couples
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: "var(--font-syne), sans-serif", color: "var(--wp-charcoal)" }}
          >
            What people are saying
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl p-5 border"
              style={{ background: "white", borderColor: "var(--wp-border)" }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-current" style={{ color: "var(--wp-gold)" }} />
                ))}
              </div>
              {/* Quote */}
              <p className="text-sm leading-relaxed mb-4 italic" style={{ color: "var(--wp-charcoal)", fontFamily: "var(--font-newsreader), serif" }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              {/* Reviewer */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <Image src={t.image} alt={t.name} width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: "var(--wp-charcoal)" }}>{t.name}</p>
                  <p className="text-xs" style={{ color: "var(--wp-muted)" }}>{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LEAD CAPTURE FORM ────────────────────────────────────────────── */}
      <section className="py-14" style={{ background: "white" }}>
        <div className="max-w-lg mx-auto px-5">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--wp-sage)" }}>
              Not ready to order yet?
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ fontFamily: "var(--font-syne), sans-serif", color: "var(--wp-charcoal)" }}
            >
              Let us reach out to you
            </h2>
            <p className="text-sm" style={{ color: "var(--wp-muted)" }}>
              Drop your details and we&apos;ll send you a free look at what your topper could look like — no commitment.
            </p>
          </div>

          {submitted ? (
            // Success state
            <div
              className="rounded-2xl p-8 text-center border"
              style={{ background: "var(--wp-ivory)", borderColor: "var(--wp-border)" }}
            >
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--wp-sage)" }} />
              <h3 className="font-bold text-xl mb-2" style={{ color: "var(--wp-charcoal)", fontFamily: "var(--font-syne), sans-serif" }}>
                You&apos;re on the list!
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--wp-muted)" }}>
                We&apos;ll reach out within 24 hours. In the meantime, feel free to browse our gallery or start your order now.
              </p>
              <Link href="/order/step1-style">
                <Button className="btn-cta border-0 gap-2">
                  Start my order now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            // Form
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--wp-charcoal)" }}>
                  Your name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sarah & Marcus"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 transition-all"
                  style={{ borderColor: "var(--wp-border)", background: "var(--wp-ivory)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--wp-charcoal)" }}>
                  Your email
                </label>
                <input
                  type="email"
                  required
                  placeholder="sarah@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 transition-all"
                  style={{ borderColor: "var(--wp-border)", background: "var(--wp-ivory)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--wp-charcoal)" }}>
                  Wedding date (approximate is fine)
                </label>
                <input
                  type="text"
                  placeholder="e.g. October 2025"
                  value={formData.weddingDate}
                  onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 transition-all"
                  style={{ borderColor: "var(--wp-border)", background: "var(--wp-ivory)" }}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="btn-cta border-0 gap-2 w-full py-6 text-base"
              >
                Send me more info
                <ArrowRight className="h-5 w-5" />
              </Button>
              <p className="text-xs text-center" style={{ color: "var(--wp-muted)" }}>
                No spam. No pressure. Just a friendly note from us.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-5 py-14">
        <div className="text-center mb-8">
          <h2
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-syne), sans-serif", color: "var(--wp-charcoal)" }}
          >
            Common questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: "var(--wp-border)", background: "white" }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <span className="font-medium text-sm" style={{ color: "var(--wp-charcoal)" }}>
                  {faq.q}
                </span>
                {openFaq === i ? (
                  <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: "var(--wp-sage)" }} />
                ) : (
                  <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: "var(--wp-sage)" }} />
                )}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm leading-relaxed" style={{ color: "var(--wp-muted)", fontFamily: "var(--font-newsreader), serif" }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA SECTION ────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: "var(--wp-charcoal)" }}>
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Ready to make yours?
          </h2>
          <p className="text-white/70 mb-8 text-lg" style={{ fontFamily: "var(--font-newsreader), serif" }}>
            Starting at $79. You approve before we print. Ships in 5–7 days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order/step1-style">
              <Button
                size="lg"
                className="btn-cta border-0 gap-2 px-10 py-6 text-base w-full sm:w-auto"
              >
                Start My Order
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 px-10 py-6 text-base border-white/40 text-white hover:bg-white/10 w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                Ask a question first
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── MINIMAL FOOTER ───────────────────────────────────────────────── */}
      <footer className="py-6 text-center text-xs" style={{ color: "var(--wp-muted)", background: "var(--wp-ivory)" }}>
        <p>© 2025 WedPrint3D · Miami, FL · <a href="mailto:hello@wedprint3d.com" className="underline">hello@wedprint3d.com</a> · +1 954-662-8622</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/" className="underline">Home</Link>
          <Link href="/gallery" className="underline">Gallery</Link>
          <Link href="/order/step1-style" className="underline">Order</Link>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP BUTTON ─────────────────────────────────────── */}
      {/* Fixed bottom-right — visible on every scroll position */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl text-white text-sm font-semibold transition-transform hover:scale-105"
        style={{ backgroundColor: "#25D366" }}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Chat with us</span>
      </a>

    </div>
  );
}
