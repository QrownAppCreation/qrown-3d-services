import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Sparkles, Clock, Shield, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className="border-b border-border bg-background/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-wp-cta fill-[var(--wp-cta)]" />
            <span className="font-bold text-xl tracking-tight">WedPrint</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/track-order">
              <Button variant="ghost" size="sm">Track my order</Button>
            </Link>
            <Link href="/order/step1-style">
              <Button
                size="sm"
                className="btn-cta border-0 hover:opacity-90"
              >
                Start your order
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Full-width background image */}
        <div className="relative h-[620px] md:h-[700px] w-full">
          <Image
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85&fit=crop&crop=center"
            alt="Happy wedding couple"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Gradient overlay: ivory at bottom, transparent at top */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-background/95" />
        </div>

        {/* Hero text overlaid at the bottom of the image */}
        <div className="absolute inset-0 flex items-end justify-center pb-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-5 bg-white/80 text-foreground border-0 shadow-sm">
              <Sparkles className="h-3 w-3 mr-1 text-wp-gold" />
              Handcrafted 3D Printed Keepsakes
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance mb-5 text-white drop-shadow-md">
              Your love story,
              <br />
              <span style={{ color: "var(--wp-gold)" }}>perfectly printed.</span>
            </h1>
            <p className="text-lg text-white/85 mb-8 text-balance max-w-xl mx-auto drop-shadow">
              Upload your photos. Choose your style. We&apos;ll hand-craft a
              custom 3D printed cake topper or keepsake that captures you perfectly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order/step1-style">
                <Button
                  size="lg"
                  className="btn-cta gap-2 text-base px-8 border-0 hover:opacity-90 shadow-lg"
                >
                  Start your order
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#gallery">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 bg-white/80 border-white/60 hover:bg-white"
                >
                  See examples
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────────── */}
      <section className="bg-wp-sage-light border-y border-[var(--wp-sage)]/30 py-5 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <Clock className="h-5 w-5 text-wp-sage" />
              <p className="font-semibold text-sm">5–7 day turnaround</p>
              <p className="text-muted-foreground text-xs hidden sm:block">Rush in 72 hrs</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Star className="h-5 w-5 text-wp-gold" />
              <p className="font-semibold text-sm">You approve first</p>
              <p className="text-muted-foreground text-xs hidden sm:block">3D preview before printing</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Shield className="h-5 w-5 text-wp-cta" />
              <p className="font-semibold text-sm">Satisfaction guaranteed</p>
              <p className="text-muted-foreground text-xs hidden sm:block">We revise until you love it</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">What we create</h2>
          <p className="text-muted-foreground text-center mb-12">
            Every piece is custom-designed from your photos, then 3D printed to order.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.map((product) => (
              <div
                key={product.name}
                className="border border-border rounded-2xl p-6 hover:shadow-md hover:border-[var(--wp-sage)] transition-all"
              >
                <div className="text-3xl mb-3">{product.icon}</div>
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">{product.description}</p>
                <p className="font-semibold text-sm text-wp-cta">{product.price}</p>
                {product.detail && (
                  <p className="text-xs text-muted-foreground mt-0.5">{product.detail}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ───────────────────────────────────────────────── */}
      <section id="gallery" className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Sample prints</h2>
          <p className="text-muted-foreground text-center mb-12">
            Every piece starts with your photos. Here&apos;s what&apos;s possible.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden aspect-square bg-muted shadow-sm hover:shadow-lg transition-shadow"
              >
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                {/* Caption overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white font-medium text-sm">{item.caption}</p>
                  <p className="text-white/70 text-xs">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/order/step1-style">
              <Button
                size="lg"
                className="btn-cta gap-2 text-base px-8 border-0 hover:opacity-90"
              >
                Create yours
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 text-white shadow-md"
                  style={{ backgroundColor: "var(--wp-sage)" }}
                >
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ──────────────────────────────────────────────── */}
      <section className="wedding-gradient py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to create something beautiful?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            It only takes 5 minutes to place your order.
          </p>
          <Link href="/order/step1-style">
            <Button
              size="lg"
              className="btn-cta gap-2 text-base px-10 border-0 hover:opacity-90 shadow-lg"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer
        className="py-10 px-4 text-white"
        style={{ backgroundColor: "var(--wp-charcoal)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 fill-current" />
            <span className="font-bold">WedPrint</span>
          </div>
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} WedPrint. Made with love.
          </p>
          <Link
            href="/operator/login"
            className="text-white/30 text-xs hover:text-white/60 transition-colors"
          >
            Operator login
          </Link>
        </div>
      </footer>
    </div>
  );
}

// ── Data ────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    icon: "🎂",
    name: "Cake Toppers",
    description: "Custom miniature figures of you and your partner, crafted from your photos.",
    price: "From $79",
    detail: null,
  },
  {
    icon: "💝",
    name: "Bridal Party Gifts",
    description: "Personalised keepsakes for your bridesmaids, groomsmen, and flower girls.",
    price: "From $49 each",
    detail: null,
  },
  {
    icon: "🎁",
    name: "Guest Favours",
    description: "Miniature custom prints your guests will treasure long after the big day.",
    price: "From $85 per 10 pieces",
    detail: "40–80mm tall",
  },
  {
    icon: "🧲",
    name: "Fridge Magnets",
    description: "Beautiful relief portraits of you two — a daily reminder of your special day.",
    price: "From $18 each",
    detail: null,
  },
];

const GALLERY = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80&fit=crop",
    caption: "Elegant Cake Topper",
    sub: "Romantic tier — PLA matte white",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80&fit=crop&crop=faces",
    caption: "Classic Couple",
    sub: "Elegant tier — hand-painted finish",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80&fit=crop",
    caption: "Fun & Playful",
    sub: "Fun tier — bright painted details",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80&fit=crop",
    caption: "Bridal Party Set",
    sub: "6-piece bridesmaid gift set",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&q=80&fit=crop",
    caption: "Adventurous Theme",
    sub: "Hiking pose — custom props",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80&fit=crop",
    caption: "Guest Favours",
    sub: "Set of 20 — 50mm relief portraits",
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
