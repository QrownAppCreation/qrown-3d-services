// Force dynamic rendering — page may fetch from DB at request time (June 30 2026)
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// app/reviews/page.tsx
// Shows DB reviews when available, falls back to static reviews so the page
// always has content — even before the first real review is submitted.
// ─────────────────────────────────────────────────────────────────────────────

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { Star, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATIC_REVIEWS } from "@/lib/reviews-data";

// Try to load DB reviews — gracefully fall back to [] if DB is unavailable
async function getReviews() {
  try {
    const { db } = await import("@/lib/db");
    const dbReviews = await db.review.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
    });
    return dbReviews;
  } catch {
    return [];
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

// WhatsApp quick link
const WHATSAPP_URL = `https://wa.me/19546628622?text=${encodeURIComponent(
  "Hi! I saw your reviews and I'm interested in a custom wedding cake topper. Can you tell me more?"
)}`;

export default async function ReviewsPage() {
  // DB reviews fetched but not displayed — static reviews shown only
  await getReviews();

  return (
    <div className="min-h-screen" style={{ background: "var(--wp-ivory)" }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Page header */}
        <div className="mb-10">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "var(--wp-charcoal)", fontFamily: "var(--font-syne), sans-serif" }}
          >
            Customer reviews
          </h1>
          <p className="text-muted-foreground mb-4">
            Real stories from couples who chose WedPrint3D for their day.
          </p>
          {/* Rating summary */}
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-bold text-lg" style={{ color: "var(--wp-charcoal)" }}>5.0</span>
            <span className="text-muted-foreground text-sm">
              · {STATIC_REVIEWS.length} reviews
            </span>
          </div>
        </div>

        {/* ── STATIC REVIEWS ───────────────────────────────────────────── */}
        <div className="space-y-6">
            {/* Featured review — Jonathan & Shantay */}
            {STATIC_REVIEWS.filter((r) => r.featured).map((r) => (
              <div
                key={r.id}
                className="rounded-2xl p-6 border-2 relative"
                style={{ background: "white", borderColor: "var(--wp-gold)" }}
              >
                <div
                  className="absolute -top-3 left-5 text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: "var(--wp-gold)" }}
                >
                  ✨ Featured Review
                </div>
                <Stars rating={r.rating} />
                <p
                  className="mt-4 text-base leading-relaxed italic"
                  style={{ color: "var(--wp-charcoal)", fontFamily: "var(--font-newsreader), serif" }}
                >
                  &ldquo;{r.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4 mt-4">
                  {/* Featured review topper image — larger rounded square */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted flex-shrink-0 shadow-md">
                    <Image
                      src={r.image}
                      alt={`${r.name} custom wedding cake topper`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "var(--wp-charcoal)" }}>
                      {r.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.location}
                      {r.weddingDate ? ` · Wedding ${r.weddingDate}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Remaining static reviews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {STATIC_REVIEWS.filter((r) => !r.featured).map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border bg-white p-5"
                  style={{ borderColor: "var(--wp-border)" }}
                >
                  {/* Topper image — shown only for the 4 couples that have one */}
                  {r.image && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted mb-3 shadow-sm">
                      <Image
                        src={r.image}
                        alt={`${r.name} custom wedding cake topper`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Stars rating={r.rating} />
                  <p
                    className="mt-3 text-sm leading-relaxed italic"
                    style={{ color: "var(--wp-charcoal)", fontFamily: "var(--font-newsreader), serif" }}
                  >
                    &ldquo;{r.quote}&rdquo;
                  </p>
                  {/* Name and location */}
                  <div className="mt-4">
                    <p className="text-xs font-bold" style={{ color: "var(--wp-charcoal)" }}>
                      {r.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        {/* ── CTA SECTION ───────────────────────────────────────────────── */}
        <div
          className="mt-14 rounded-2xl p-8 text-center"
          style={{ background: "var(--wp-charcoal)" }}
        >
          <h2
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Ready to create yours?
          </h2>
          <p className="text-white/70 mb-6 text-sm">
            Starting at $79 · You approve before we print · Ships in 5–7 days
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/order/step1-style">
              <Button className="btn-cta border-0 gap-2 px-8 py-5 w-full sm:w-auto">
                Start My Custom Topper
              </Button>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="gap-2 px-8 py-5 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" />
                Ask a question first
              </Button>
            </a>
          </div>
          <p className="text-white/50 text-xs mt-4">
            Have a topper already? &nbsp;
            <Link href="/share-your-moment" className="underline hover:text-white">
              Share your moment →
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="border-t py-8 px-4 mt-12"
        style={{ backgroundColor: "var(--wp-charcoal)", borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="max-w-6xl mx-auto flex justify-center">
          <Logo width={160} variant="onDark" href="/" />
        </div>
      </footer>

      {/* Floating WhatsApp button */}
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
