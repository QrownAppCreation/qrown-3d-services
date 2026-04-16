"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NotEdibleDisclaimer } from "@/components/NotEdibleDisclaimer";
import { Star, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ShareYourMomentPage() {
  const [coupleName, setCoupleName] = useState("");
  const [comment, setComment] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [rating, setRating] = useState(5);
  const [weddingPhoto, setWeddingPhoto] = useState<File | null>(null);
  const [cakePhoto, setCakePhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coupleName.trim() || !comment.trim()) {
      toast.error("Please add your names and a short review.");
      return;
    }
    if (!weddingPhoto || !cakePhoto) {
      toast.error("Please upload both photos.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("coupleName", coupleName.trim());
      fd.append("comment", comment.trim());
      fd.append("rating", String(rating));
      if (weddingDate) fd.append("weddingDate", weddingDate);
      fd.append("weddingPhoto", weddingPhoto);
      fd.append("cakePhoto", cakePhoto);

      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      toast.success(data.message ?? "Thank you!");
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--wp-ivory)" }}>
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--wp-charcoal)" }}>
          Share your moment
        </h1>
        <p className="text-muted-foreground mb-6">
          We&apos;d love to feature your wedding and our cake topper on our site. Submissions are
          reviewed before they appear publicly.
        </p>

        <NotEdibleDisclaimer className="mb-8" />

        {done ? (
          <div className="rounded-2xl border bg-white p-8 text-center space-y-4" style={{ borderColor: "var(--wp-border)" }}>
            <p className="text-lg font-medium" style={{ color: "var(--wp-charcoal)" }}>
              Thank you!
            </p>
            <p className="text-muted-foreground text-sm">
              Your photos and review were received. We&apos;ll email you if we have questions.
            </p>
            <Link href="/">
              <Button className="btn-cta border-0 mt-2">Back to home</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-white p-6 md:p-8" style={{ borderColor: "var(--wp-border)" }}>
            <div className="space-y-2">
              <Label htmlFor="coupleName">Your names (as you&apos;d like them shown)</Label>
              <Input
                id="coupleName"
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                placeholder="Alex & Jordan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weddingDate">Wedding date (optional)</Label>
              <Input
                id="weddingDate"
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium leading-none">Rating</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="p-1 rounded-md hover:bg-muted transition-colors"
                    aria-label={`${n} stars`}
                  >
                    <Star
                      className={`h-8 w-8 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/35"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Short review</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience…"
                rows={4}
                required
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weddingPhoto">Photo — you two with the cake topper</Label>
              <Input
                id="weddingPhoto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setWeddingPhoto(e.target.files?.[0] ?? null)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cakePhoto">Photo — the cake with the topper</Label>
              <Input
                id="cakePhoto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setCakePhoto(e.target.files?.[0] ?? null)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full btn-cta border-0"
              size="lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting…
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        )}
      </div>

      <footer className="border-t py-8 px-4 mt-12" style={{ backgroundColor: "var(--wp-charcoal)", borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="max-w-6xl mx-auto flex justify-center">
          <Logo width={160} variant="onDark" href="/" />
        </div>
      </footer>
    </div>
  );
}
