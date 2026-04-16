import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import type { Review } from "@prisma/client";

type ReviewPublic = Pick<
  Review,
  "id" | "coupleName" | "rating" | "comment" | "photoUrl" | "cakePhotoUrl" | "weddingDate"
>;

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection({ reviews }: { reviews: ReviewPublic[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-white border-t" style={{ borderColor: "var(--wp-border)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--wp-charcoal)" }}>
            Love from real couples
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "var(--wp-muted)" }}>
            Moments shared by customers after the big day
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => {
            const img = r.photoUrl ?? r.cakePhotoUrl;
            return (
              <article
                key={r.id}
                className="rounded-2xl border overflow-hidden bg-[var(--wp-secondary-bg)] flex flex-col"
                style={{ borderColor: "var(--wp-border)" }}
              >
                {img && (
                  <div className="relative aspect-[4/3] w-full bg-muted">
                    <Image
                      src={img}
                      alt={`${r.coupleName} wedding photo`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <Stars rating={r.rating} />
                  <p className="font-semibold mt-2" style={{ color: "var(--wp-charcoal)" }}>
                    {r.coupleName}
                  </p>
                  {r.weddingDate && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.weddingDate).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  <p className="text-sm mt-3 flex-1 leading-relaxed" style={{ color: "var(--wp-muted)" }}>
                    &ldquo;{r.comment}&rdquo;
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="text-center mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/reviews">
            <Button variant="outline" size="lg" className="px-8">
              Read all reviews
            </Button>
          </Link>
          <Link href="/share-your-moment">
            <Button size="lg" className="btn-cta border-0 px-8">
              Share your moment
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
