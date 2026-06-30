// Force dynamic rendering — page fetches from DB which is only available at request time, not build time (June 30 2026)
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Reviews — WedPrint" };

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const reviews = await db.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--wp-ivory)" }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--wp-charcoal)" }}>
          Customer reviews
        </h1>
        <p className="text-muted-foreground mb-10">
          Real stories from couples who chose WedPrint for their day.
        </p>

        {reviews.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center border rounded-2xl bg-white">
            No published reviews yet. Be the first to{" "}
            <Link href="/share-your-moment" className="underline text-[var(--wp-sage)]">
              share your moment
            </Link>
            !
          </p>
        ) : (
          <div className="space-y-8">
            {reviews.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border bg-white p-6 md:p-8 flex flex-col md:flex-row gap-6"
                style={{ borderColor: "var(--wp-border)" }}
              >
                <div className="flex gap-3 md:flex-col md:w-64 shrink-0">
                  {r.photoUrl && (
                    <div className="relative w-full md:w-64 aspect-square rounded-xl overflow-hidden bg-muted">
                      <Image
                        src={r.photoUrl}
                        alt="Wedding with topper"
                        fill
                        className="object-cover"
                        sizes="256px"
                      />
                    </div>
                  )}
                  {r.cakePhotoUrl && (
                    <div className="relative w-full md:w-64 aspect-square rounded-xl overflow-hidden bg-muted">
                      <Image
                        src={r.cakePhotoUrl}
                        alt="Cake with topper"
                        fill
                        className="object-cover"
                        sizes="256px"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Stars rating={r.rating} />
                  <h2 className="text-xl font-semibold mt-3" style={{ color: "var(--wp-charcoal)" }}>
                    {r.coupleName}
                  </h2>
                  {r.weddingDate && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(r.weddingDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  <p className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {r.comment}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/share-your-moment">
            <Button className="btn-cta border-0">Share your moment</Button>
          </Link>
        </div>
      </div>

      <footer className="border-t py-8 px-4 mt-12" style={{ backgroundColor: "var(--wp-charcoal)", borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="max-w-6xl mx-auto flex justify-center">
          <Logo width={160} variant="onDark" href="/" />
        </div>
      </footer>
    </div>
  );
}
