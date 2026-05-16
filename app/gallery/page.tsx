"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

// ── Tier 1: 1 Color ──────────────────────────────────────────────────────────

const ONE_COLOR_ITEMS = [
  {
    id: 1,
    alt: "Classic 1-color white 3D printed wedding cake topper on heart base",
    src: "/images/Couple4/couple4-3dmodel-1color.png",
    isLocal: true,
    label: "Heart base",
  },
  {
    id: 2,
    alt: "Classic 1-color 3D printed wedding cake topper",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Mini-Me-Cake-Topper-1.png",
    isLocal: false,
    label: "Round base",
  },
  {
    id: 3,
    alt: "Classic 1-color 3D printed wedding cake topper style 2",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Wedding%203.PNG",
    isLocal: false,
    label: "Classic style",
  },
];

// ── Tier 2: Classic (2–3 colors) ─────────────────────────────────────────────

const CLASSIC_ITEMS = [
  {
    id: 1,
    alt: "2-color 3D printed wedding cake topper — skin tones and outfit colors distinguished",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Mini-Me-Cake-Topper-3.png",
    isLocal: false,
    label: "2 colors",
  },
  {
    id: 2,
    alt: "3-color 3D printed wedding cake topper — full detail",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Mini-Me-Cake-Topper-7.png",
    isLocal: false,
    label: "3 colors",
  },
  {
    id: 3,
    alt: "2-color 3D printed wedding figurine — standing pose",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Wedding%201.PNG",
    isLocal: false,
    label: "2 colors",
  },
  {
    id: 4,
    alt: "3-color 3D printed wedding figurine — full detail",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Wedding%202.PNG",
    isLocal: false,
    label: "3 colors",
  },
];

// ── Tier 3: Heirloom — Real couple photos ────────────────────────────────────

const HEIRLOOM_COUPLES = [
  {
    id: 1,
    caption: "Classic Elegance",
    story: "Timeless pose, flawless detail. The topper that sets the tone for the whole reception.",
    src: "/images/hero-topper-header.png",
    alt: "Couple 1 — classic elegant heirloom wedding cake topper, clean product shot",
  },
  {
    id: 4,
    caption: "Bold & Confident",
    story: "Arms crossed, back to back — a topper with as much personality as the couple who ordered it.",
    src: "/images/Couple4/couple4-product-shot.png",
    alt: "Couple 4 — bold arms-crossed pose heirloom 3D printed wedding figurine",
  },
  {
    id: 5,
    caption: "Walking Into Forever",
    story: "Step for step, side by side. Every detail captured — right down to the locs and the dress.",
    src: "/images/Couple5/couple5-product-shot-2.png",
    alt: "Couple 5 — walking pose heirloom 3D printed wedding figurine held in hand",
  },
];

// ── Videos ────────────────────────────────────────────────────────────────────

const VIDEOS = [
  "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Webm_V2_04deabd4ad.webm",
  "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Webm_V4_d8134897af.webm",
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--wp-ivory)" }}>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="border-b sticky top-0 z-50 bg-background/90 backdrop-blur-sm"
           style={{ borderColor: "var(--wp-border)" }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo width={200} href="/" />
          <div className="flex items-center gap-3">
            <Link href="/gallery">
              <Button variant="ghost" size="sm" style={{ color: "var(--wp-sage)", fontWeight: 600 }}>
                Gallery
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Pricing
              </Button>
            </Link>
            <Link href="/track-order">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Track my order
              </Button>
            </Link>
            <Link href="/order/step1-style">
              <Button size="sm" className="btn-cta border-0 hover:opacity-90">
                Start your order
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 text-center" style={{ backgroundColor: "var(--wp-secondary-bg)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-5"
               style={{ backgroundColor: "var(--wp-sage)", color: "white" }}>
            <Sparkles className="h-3.5 w-3.5" />
            Every piece starts with your photos
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
              style={{ color: "var(--wp-charcoal)", fontFamily: "var(--font-syne)" }}>
            Your love story,<br />in three tiers
          </h1>
          <p className="text-lg" style={{ color: "var(--wp-muted)" }}>
            Choose the level of detail that feels right. Every tier starts with your photos and ends with something you&apos;ll keep forever.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-16 space-y-24">

        {/* ══════════════════════════════════════════════════════════════════
            TIER 01 — 1 Color
            ══════════════════════════════════════════════════════════════ */}
        <section>
          <TierHeader
            number="01"
            name="1 Color"
            tagline="Pure & Timeless"
            description="One filament, flawless finish. Your couple sculpted from your photos in a single elegant shade — clean, classic, and unmistakably yours."
            includes={[
              "Custom sculpted from your reference photos",
              "Heart or round base",
              "5–7 day production turnaround",
              "3D preview before we print",
            ]}
            priceNote="Starting at $79"
            accentColor="var(--wp-charcoal)"
            badgeBg="#F3F4F6"
            badgeColor="#374151"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">
            {ONE_COLOR_ITEMS.map((item) => (
              <SimpleImageCard key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/order/step1-style">
              <Button size="lg" className="btn-cta border-0 hover:opacity-90 gap-2 px-8">
                Order 1 Color
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t" style={{ borderColor: "var(--wp-border)" }} />

        {/* ══════════════════════════════════════════════════════════════════
            TIER 02 — Classic
            ══════════════════════════════════════════════════════════════ */}
        <section>
          <TierHeader
            number="02"
            name="Classic"
            tagline="Skin Tones & Outfit Colors"
            description="Two to three colors bring your couple to life. Hair, skin, and outfits each get their own shade — so anyone who sees it knows exactly who it is."
            includes={[
              "2–3 filament colors",
              "Skin tones, hair, and outfits each distinguished",
              "Custom sculpted from your reference photos",
              "3D preview before we print",
            ]}
            priceNote="Pricing at checkout"
            accentColor="var(--wp-sage)"
            badgeBg="#EEF2EC"
            badgeColor="#5A7052"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-10">
            {CLASSIC_ITEMS.map((item) => (
              <SimpleImageCard key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/order/step1-style">
              <Button size="lg" className="btn-cta border-0 hover:opacity-90 gap-2 px-8">
                Order Classic
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t" style={{ borderColor: "var(--wp-border)" }} />

        {/* ══════════════════════════════════════════════════════════════════
            TIER 03 — Heirloom
            ══════════════════════════════════════════════════════════════ */}
        <section>
          <TierHeader
            number="03"
            name="Heirloom"
            tagline="Full Color · Maximum Detail"
            description="Our most detailed tier. Multi-color prints that capture everything — outfit patterns, skin tone depth, accessories, and personality. Not just a topper. A keepsake."
            includes={[
              "4+ filament colors for maximum realism",
              "Outfit details, accessories & hair texture",
              "Displayed in hand or on base",
              "3D preview + revision round before printing",
            ]}
            priceNote="Pricing at checkout"
            accentColor="var(--wp-gold)"
            badgeBg="#FDF6E3"
            badgeColor="#92701A"
          />

          {/* Large couple feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
            {HEIRLOOM_COUPLES.map((couple) => (
              <HeirloomCard key={couple.id} couple={couple} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/order/step1-style">
              <Button size="lg" className="btn-cta border-0 hover:opacity-90 gap-2 px-10 py-6 text-base shadow-lg">
                Order Heirloom
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-3 text-sm" style={{ color: "var(--wp-muted)" }}>
              You approve a 3D preview before anything is printed.
            </p>
          </div>
        </section>

      </main>

      {/* ── Video section ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t" style={{ borderColor: "var(--wp-border)", backgroundColor: "var(--wp-secondary-bg)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--wp-charcoal)" }}>
              Watch the magic happen
            </h2>
            <p className="text-base" style={{ color: "var(--wp-muted)" }}>
              Every piece is printed layer by layer on our Bambu Lab printers — right here in Miami.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {VIDEOS.map((src, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border shadow-sm bg-black"
                   style={{ borderColor: "var(--wp-border)" }}>
                <video
                  src={src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ maxHeight: "380px" }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: "var(--wp-charcoal)" }}>
        <div className="max-w-xl mx-auto space-y-6">
          <Heart className="h-10 w-10 mx-auto" style={{ color: "var(--wp-cta)", fill: "var(--wp-cta)" }} />
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to create yours?
          </h2>
          <p className="text-lg" style={{ color: "#CBD5C0" }}>
            Upload your photos, pick your tier, and we&apos;ll hand-craft a topper that stops the room.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/order/step1-style">
              <Button size="lg" className="btn-cta border-0 hover:opacity-90 gap-2 px-8 text-base shadow-lg">
                Start Your Order
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="gap-2 px-8 text-base border-white/30 text-white hover:bg-white/10">
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-4 border-t" style={{ borderColor: "var(--wp-border)", backgroundColor: "var(--wp-secondary-bg)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Logo width={160} />
            <span className="text-sm" style={{ color: "var(--wp-muted)" }}>Handcrafted 3D keepsakes</span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--wp-muted)" }}>
            <Link href="/"        className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/gallery" className="hover:text-foreground transition-colors" style={{ color: "var(--wp-sage)" }}>Gallery</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TierHeader({
  number, name, tagline, description, includes, priceNote,
  accentColor, badgeBg, badgeColor,
}: {
  number: string;
  name: string;
  tagline: string;
  description: string;
  includes: string[];
  priceNote: string;
  accentColor: string;
  badgeBg: string;
  badgeColor: string;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-8">
      {/* Left — tier identity */}
      <div className="lg:w-2/5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl font-black tracking-tighter opacity-20"
                style={{ color: accentColor, fontFamily: "var(--font-syne)" }}>
            {number}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: badgeBg, color: badgeColor }}>
            {name}
          </span>
        </div>
        <h2 className="text-3xl font-bold mb-3"
            style={{ color: "var(--wp-charcoal)", fontFamily: "var(--font-syne)" }}>
          {tagline}
        </h2>
        <p className="text-base leading-relaxed" style={{ color: "var(--wp-muted)" }}>
          {description}
        </p>
      </div>

      {/* Right — what's included + price */}
      <div className="lg:w-3/5 lg:pl-8 lg:border-l" style={{ borderColor: "var(--wp-border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3"
           style={{ color: "var(--wp-muted)" }}>
          What&apos;s included
        </p>
        <ul className="space-y-2 mb-5">
          {includes.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--wp-charcoal)" }}>
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-sm font-semibold" style={{ color: accentColor }}>
          {priceNote}
        </p>
      </div>
    </div>
  );
}

function SimpleImageCard({ item }: {
  item: { id: number; alt: string; src: string; isLocal: boolean; label: string };
}) {
  return (
    <div className="group rounded-2xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition-all duration-300"
         style={{ borderColor: "var(--wp-border)" }}>
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
        {item.isLocal ? (
          <Image
            src={item.src}
            alt={item.alt}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt={item.alt}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>
      <div className="px-4 py-3">
        <p className="text-xs font-medium" style={{ color: "var(--wp-muted)" }}>{item.label}</p>
      </div>
    </div>
  );
}

function HeirloomCard({ couple }: {
  couple: { id: number; caption: string; story: string; src: string; alt: string };
}) {
  return (
    <div className="group rounded-2xl overflow-hidden border bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
         style={{ borderColor: "var(--wp-border)" }}>

      {/* Large portrait image */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "3/4" }}>
        <Image
          src={couple.src}
          alt={couple.alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        {/* Subtle gradient at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <p className="font-bold text-base" style={{ color: "var(--wp-charcoal)" }}>
            {couple.caption}
          </p>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--wp-muted)" }}>
            {couple.story}
          </p>
        </div>
        <div className="mt-auto pt-3">
          <Link href="/order/step1-style" className="block">
            <Button size="sm" className="w-full btn-cta border-0 hover:opacity-90 gap-1.5 text-sm">
              Order Yours
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
