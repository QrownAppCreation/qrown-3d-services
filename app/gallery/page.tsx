"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight, Sparkles, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────

type Tier   = "CLASSIC" | "DUO" | "SIGNATURE" | "HEIRLOOM";
type Filter = "ALL" | "CAKE_TOPPER" | "FIGURINE" | "BY_TIER";

interface GalleryItem {
  id: number;
  tier: Tier;
  productType: "Cake Topper" | "Figurine";
  filterType: "CAKE_TOPPER" | "FIGURINE";
  alt: string;
  src: string;
  description: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────
// Real WedPrint pieces — photos served from Supabase Storage.

const ITEMS: GalleryItem[] = [
  {
    id: 1,
    tier: "CLASSIC",
    productType: "Cake Topper",
    filterType: "CAKE_TOPPER",
    alt: "Classic 1-color 3D printed wedding cake topper",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Mini-Me-Cake-Topper-1.png",
    description: "1 color · Clean, elegant, timeless",
  },
  {
    id: 2,
    tier: "DUO",
    productType: "Cake Topper",
    filterType: "CAKE_TOPPER",
    alt: "Duo 2-color 3D printed wedding cake topper",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Mini-Me-Cake-Topper-3.png",
    description: "2 colors · Skin tones and outfit colors distinguished",
  },
  {
    id: 3,
    tier: "SIGNATURE",
    productType: "Cake Topper",
    filterType: "CAKE_TOPPER",
    alt: "Signature 3-color 3D printed wedding cake topper",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Mini-Me-Cake-Topper-7.png",
    description: "3 colors · Full detail",
  },
  {
    id: 4,
    tier: "HEIRLOOM",
    productType: "Figurine",
    filterType: "FIGURINE",
    alt: "Heirloom 4+ color 3D printed wedding figurine",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Mini-Me-Cake-Topper-g1_1.png",
    description: "4+ colors · Maximum detail",
  },
  {
    id: 5,
    tier: "CLASSIC",
    productType: "Figurine",
    filterType: "FIGURINE",
    alt: "Classic black and white 3D printed bridal figurine",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Black%20and%20White%20.JPG",
    description: "1 color · Clean, elegant, timeless",
  },
  {
    id: 6,
    tier: "HEIRLOOM",
    productType: "Cake Topper",
    filterType: "CAKE_TOPPER",
    alt: "Heirloom full-color 3D printed wedding cake topper",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/MIxed_full%20color.JPG",
    description: "4+ colors · Maximum detail",
  },
  {
    id: 7,
    tier: "DUO",
    productType: "Figurine",
    filterType: "FIGURINE",
    alt: "Duo 2-color 3D printed wedding figurine",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Wedding%201.PNG",
    description: "2 colors · Skin tones and outfit colors distinguished",
  },
  {
    id: 8,
    tier: "SIGNATURE",
    productType: "Figurine",
    filterType: "FIGURINE",
    alt: "Signature 3-color 3D printed wedding figurine",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Wedding%202.PNG",
    description: "3 colors · Full detail",
  },
  {
    id: 9,
    tier: "CLASSIC",
    productType: "Cake Topper",
    filterType: "CAKE_TOPPER",
    alt: "Classic 1-color 3D printed wedding cake topper",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Wedding%203.PNG",
    description: "1 color · Clean, elegant, timeless",
  },
  {
    id: 10,
    tier: "SIGNATURE",
    productType: "Cake Topper",
    filterType: "CAKE_TOPPER",
    alt: "Signature 3-color 3D printed cake topper with gold heart detail",
    src: "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Couple%201%20before%20the%20other%20%2C%20gold%20heart.PNG",
    description: "3 colors · Full detail",
  },
];

// ── Videos ────────────────────────────────────────────────────────────────────
const VIDEOS = [
  "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Webm_V2_04deabd4ad.webm",
  "https://ojlvahybqjaaxivaysuc.supabase.co/storage/v1/object/public/Gallery/Webm_V4_d8134897af.webm",
];

// ── Tier config ───────────────────────────────────────────────────────────────

const TIERS: Record<Tier, {
  label: string;
  colors: string;
  description: string;
  badge: string;
  dot: string;
}> = {
  CLASSIC: {
    label: "Classic",
    colors: "1 color",
    description: "Clean, elegant, timeless — single-filament print with a flawless finish.",
    badge: "bg-gray-100 text-gray-700 border border-gray-200",
    dot:   "bg-gray-400",
  },
  DUO: {
    label: "Duo",
    colors: "2 colors",
    description: "Skin tones and outfit colors distinguished — twice the personality.",
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    dot:   "bg-blue-400",
  },
  SIGNATURE: {
    label: "Signature",
    colors: "3 colors",
    description: "Full detail — hair, skin, and attire each a distinct colour.",
    badge: "bg-purple-100 text-purple-700 border border-purple-200",
    dot:   "bg-purple-500",
  },
  HEIRLOOM: {
    label: "Heirloom",
    colors: "4+ colors",
    description: "Maximum detail — multi-colour outfits, accessories, and pets included.",
    badge: "bg-amber-100 text-amber-800 border border-amber-200",
    dot:   "bg-amber-500",
  },
};

// ── Filter tabs config ────────────────────────────────────────────────────────

const FILTERS: { id: Filter; label: string }[] = [
  { id: "ALL",        label: "All" },
  { id: "CAKE_TOPPER", label: "Cake Toppers" },
  { id: "FIGURINE",   label: "Figurines" },
  { id: "BY_TIER",    label: "By Color Tier" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("ALL");

  const filteredItems = activeFilter === "ALL" || activeFilter === "BY_TIER"
    ? ITEMS
    : ITEMS.filter((i) => i.filterType === activeFilter);

  const tierOrder: Tier[] = ["CLASSIC", "DUO", "SIGNATURE", "HEIRLOOM"];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--wp-ivory)" }}>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="border-b sticky top-0 z-50 bg-background/90 backdrop-blur-sm"
           style={{ borderColor: "var(--wp-border)" }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-5 w-5" style={{ color: "var(--wp-cta)", fill: "var(--wp-cta)" }} />
            <span className="font-bold text-xl tracking-tight" style={{ color: "var(--wp-charcoal)" }}>
              WedPrint
            </span>
          </Link>
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

      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <section className="py-16 px-4 text-center" style={{ backgroundColor: "var(--wp-secondary-bg)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-5"
               style={{ backgroundColor: "var(--wp-sage)", color: "white", opacity: 0.9 }}>
            <Sparkles className="h-3.5 w-3.5" />
            Real love stories
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4"
              style={{ color: "var(--wp-charcoal)" }}>
            Our Gallery
          </h1>
          <p className="text-xl" style={{ color: "var(--wp-muted)" }}>
            Real love stories, perfectly printed
          </p>
        </div>
      </section>

      {/* ── Filter tabs ───────────────────────────────────────────────────── */}
      <section className="sticky top-[65px] z-40 border-b shadow-sm"
               style={{ backgroundColor: "var(--wp-ivory)", borderColor: "var(--wp-border)" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className="flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-150"
                style={
                  activeFilter === f.id
                    ? { backgroundColor: "var(--wp-charcoal)", color: "white" }
                    : { backgroundColor: "transparent", color: "var(--wp-muted)" }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-12">

        {/* ── BY TIER view ────────────────────────────────────────────────── */}
        {activeFilter === "BY_TIER" ? (
          <div className="space-y-16">
            {tierOrder.map((tier) => {
              const tierItems = ITEMS.filter((i) => i.tier === tier);
              const cfg = TIERS[tier];
              return (
                <div key={tier}>
                  {/* Tier header */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6
                                  pb-4 border-b" style={{ borderColor: "var(--wp-border)" }}>
                    <div className="flex items-center gap-3">
                      {/* Color dots */}
                      <div className="flex gap-1.5">
                        {Array.from({ length: tier === "HEIRLOOM" ? 4 : ["CLASSIC","DUO","SIGNATURE"].indexOf(tier) + 1 }).map((_, i) => (
                          <span key={i} className={`w-4 h-4 rounded-full ${cfg.dot}`}
                                style={{ opacity: 1 - i * 0.18 }} />
                        ))}
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${cfg.badge}`}>
                        {cfg.label} — {cfg.colors}
                      </span>
                    </div>
                    <p className="text-sm sm:ml-auto" style={{ color: "var(--wp-muted)" }}>
                      {cfg.description}
                    </p>
                  </div>

                  {/* Items for this tier */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tierItems.map((item) => (
                      <GalleryCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        ) : (
          /* ── ALL / CAKE_TOPPER / FIGURINE flat grid ─────────────────────── */
          filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ color: "var(--wp-muted)" }}>No items in this category yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <GalleryCard key={item.id} item={item} />
              ))}
            </div>
          )
        )}
      </main>

      {/* ── Video section ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t" style={{ borderColor: "var(--wp-border)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
                 style={{ backgroundColor: "var(--wp-secondary-bg)", color: "var(--wp-sage)" }}>
              <Sparkles className="h-3.5 w-3.5" />
              Behind the scenes
            </div>
            <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--wp-charcoal)" }}>
              Watch the magic happen
            </h2>
            <p className="text-base" style={{ color: "var(--wp-muted)" }}>
              Every piece is printed layer by layer on our Bambu Lab printers — right here in Miami.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {VIDEOS.map((src, i) => (
              <div key={i}
                   className="rounded-2xl overflow-hidden border shadow-sm bg-black"
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

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-center border-t" style={{ borderColor: "var(--wp-border)", backgroundColor: "var(--wp-secondary-bg)" }}>
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex justify-center">
            <Heart className="h-10 w-10" style={{ color: "var(--wp-cta)", fill: "var(--wp-cta)" }} />
          </div>
          <h2 className="text-4xl font-bold" style={{ color: "var(--wp-charcoal)" }}>
            Ready to create yours?
          </h2>
          <p className="text-lg" style={{ color: "var(--wp-muted)" }}>
            Upload your photos, choose your tier, and we&apos;ll hand-craft something
            truly unique for your big day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/order/step1-style">
              <Button size="lg" className="btn-cta border-0 hover:opacity-90 gap-2 px-8 text-base shadow-lg">
                Start Your Order
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="gap-2 px-8 text-base"
                      style={{ borderColor: "var(--wp-border)", color: "var(--wp-charcoal)" }}>
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-4 border-t" style={{ borderColor: "var(--wp-border)", backgroundColor: "var(--wp-secondary-bg)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" style={{ color: "var(--wp-cta)", fill: "var(--wp-cta)" }} />
            <span className="font-semibold" style={{ color: "var(--wp-charcoal)" }}>WedPrint</span>
            <span className="text-sm" style={{ color: "var(--wp-muted)" }}>· Handcrafted 3D Keepsakes</span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--wp-muted)" }}>
            <Link href="/"       className="hover:text-foreground transition-colors">Home</Link>
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

// ── Gallery card ──────────────────────────────────────────────────────────────

// Placeholder backgrounds per tier — shown when the image URL fails to load
const TIER_PLACEHOLDER_BG: Record<Tier, string> = {
  CLASSIC:   "from-stone-100  to-stone-200",
  DUO:       "from-blue-100   to-blue-200",
  SIGNATURE: "from-purple-100 to-purple-200",
  HEIRLOOM:  "from-amber-100  to-amber-200",
};

function GalleryCard({ item }: { item: GalleryItem }) {
  const [imgError, setImgError] = useState(false);
  const cfg = TIERS[item.tier];
  const dotCount = item.tier === "HEIRLOOM" ? 4
                 : item.tier === "SIGNATURE" ? 3
                 : item.tier === "DUO"       ? 2
                 : 1;

  return (
    <div className="group rounded-2xl overflow-hidden border bg-white shadow-sm
                    hover:shadow-lg transition-all duration-300"
         style={{ borderColor: "var(--wp-border)" }}>

      {/* Image or placeholder */}
      <div className="relative overflow-hidden" style={{ height: "280px", backgroundColor: "#F8F8F6" }}>
        {imgError ? (
          /* ── Styled fallback — shown when external URL fails to load ── */
          <div className={`w-full h-full bg-gradient-to-br ${TIER_PLACEHOLDER_BG[item.tier]}
                          flex flex-col items-center justify-center gap-3 px-4 text-center`}>
            <Layers className="h-10 w-10 opacity-40"
                    style={{ color: item.tier === "HEIRLOOM" ? "#92400e"
                                  : item.tier === "SIGNATURE" ? "#6d28d9"
                                  : item.tier === "DUO"       ? "#1d4ed8"
                                  : "#374151" }} />
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--wp-charcoal)" }}>
                {cfg.label} {item.productType}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--wp-muted)" }}>
                {cfg.colors}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
              Sample coming soon
            </span>
          </div>
        ) : (
          /* ── Real image — falls back to placeholder on error ── */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt={item.alt}
            className="w-full h-full object-contain p-3
                       transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}

        {/* Tier badge overlay — shown on both real image and placeholder */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                            text-xs font-semibold shadow-sm ${cfg.badge}`}>
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 space-y-3">
        <div>
          <p className="font-semibold" style={{ color: "var(--wp-charcoal)" }}>
            {item.productType}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--wp-muted)" }}>
            {item.description}
          </p>
        </div>

        {/* Color dots row */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: dotCount }).map((_, i) => (
            <span key={i} className={`w-3 h-3 rounded-full ${cfg.dot}`}
                  style={{ opacity: 1 - i * 0.2 }} />
          ))}
          <span className="text-xs ml-1" style={{ color: "var(--wp-muted)" }}>
            {cfg.colors}
          </span>
        </div>

        <Link href="/order/step1-style" className="block">
          <Button size="sm" className="w-full btn-cta border-0 hover:opacity-90 gap-1.5 text-sm">
            Order Yours
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
