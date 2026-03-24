"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, CheckCircle2, RotateCcw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  design: {
    id: string;
    stlUrl: string | null;
    previewImageUrl: string | null;
    category: string;
    quantity: number;
    revisionRound: number;
    token: string;
  };
  couple: {
    name: string;
  };
}

type Screen = "review" | "revision_form" | "approved" | "revision_sent";

export default function ApprovalClient({ design, couple }: Props) {
  const [screen, setScreen] = useState<Screen>("review");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    try {
      const res = await fetch(`/api/designs/${design.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", token: design.token }),
      });

      if (!res.ok) throw new Error("Approval failed");
      setScreen("approved");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevision() {
    if (!revisionNotes.trim()) {
      toast.error("Please describe the changes you'd like.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/designs/${design.id}/revision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: design.token,
          clientNotes: revisionNotes,
        }),
      });

      if (!res.ok) throw new Error("Revision request failed");
      setScreen("revision_sent");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (screen === "approved") {
    return (
      <div className="min-h-screen wedding-gradient flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-5">
          <Link href="/" className="flex items-center gap-2 justify-center">
            <Heart className="h-6 w-6 text-wedprint-rose fill-wedprint-rose" />
            <span className="font-bold text-2xl">WedPrint</span>
          </Link>
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Design approved! 🎉</h1>
          <p className="text-muted-foreground">
            Your design is approved and heading to the printer. We&apos;ll be in
            touch soon when your order is ready!
          </p>
        </div>
      </div>
    );
  }

  if (screen === "revision_sent") {
    return (
      <div className="min-h-screen wedding-gradient flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-5">
          <Link href="/" className="flex items-center gap-2 justify-center">
            <Heart className="h-6 w-6 text-wedprint-rose fill-wedprint-rose" />
            <span className="font-bold text-2xl">WedPrint</span>
          </Link>
          <div className="text-5xl">📝</div>
          <h1 className="text-2xl font-bold">Got it!</h1>
          <p className="text-muted-foreground">
            We&apos;ve received your revision request. We&apos;ll update your
            design and send you a new preview within 48 hours.
          </p>
        </div>
      </div>
    );
  }

  const firstName = couple.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-wedprint-rose fill-wedprint-rose" />
            <span className="font-bold text-lg">WedPrint</span>
          </Link>
          <span className="text-sm text-muted-foreground">
            Design approval
            {design.revisionRound > 1 && ` — Revision ${design.revisionRound}`}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Hi {firstName}! Your design is ready ✨
          </h1>
          <p className="text-muted-foreground">
            Review your custom{" "}
            {design.category.replace(/_/g, " ").toLowerCase()} below. You can
            rotate and zoom the 3D model. Once you&apos;re happy, click Approve
            — or let us know what you&apos;d like changed.
          </p>
        </div>

        {/* 3D viewer / preview */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="bg-muted/30 aspect-square max-h-[500px] flex items-center justify-center">
            {design.previewImageUrl ? (
              <img
                src={design.previewImageUrl}
                alt="Your design preview"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-center text-muted-foreground p-10">
                <div className="text-6xl mb-4">🎂</div>
                <p className="font-medium">
                  Your 3D design preview will appear here
                </p>
                <p className="text-sm mt-1">
                  Our team is preparing the preview image
                </p>
              </div>
            )}
          </div>

          {design.stlUrl && (
            <div className="border-t border-border px-6 py-4 bg-muted/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">3D model ready</p>
                  <p className="text-muted-foreground text-xs">
                    {design.category.replace(/_/g, " ")} ×{design.quantity}
                  </p>
                </div>
                <a
                  href={design.stlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View 3D file
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Decision buttons */}
        {screen === "review" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={handleApprove}
              disabled={loading}
              className={cn(
                "rounded-2xl border-2 border-green-500 bg-green-50 p-6 text-left hover:bg-green-100 transition-colors",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-lg text-green-800">
                  Approve this design
                </h3>
              </div>
              <p className="text-green-700 text-sm">
                I love it! Please go ahead and print this design.
              </p>
            </button>

            <button
              onClick={() => setScreen("revision_form")}
              disabled={loading}
              className="rounded-2xl border-2 border-border bg-white p-6 text-left hover:border-primary/50 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <RotateCcw className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-lg">Request changes</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Something&apos;s not quite right — I&apos;d like a revision.
              </p>
            </button>
          </div>
        )}

        {/* Revision form */}
        {screen === "revision_form" && (
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Request changes</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Please describe what you&apos;d like changed. Be as specific as
              possible — the more detail, the better we can nail the revision.
            </p>
            <Textarea
              placeholder="e.g. Could you make the hair a bit longer on Partner 1? And could the pose be more of an embrace rather than side-by-side?"
              rows={5}
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                onClick={handleRevision}
                disabled={loading || !revisionNotes.trim()}
                className="gap-2"
              >
                {loading ? "Submitting..." : "Submit revision request"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setScreen("review")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="rounded-2xl border border-border bg-white p-6 space-y-3">
          <h3 className="font-semibold">How does this work?</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Approve →</strong> We
              immediately queue your piece for printing. Your balance is due on
              delivery.
            </p>
            <p>
              <strong className="text-foreground">Request changes →</strong> We
              revise your design within 48 hours and send a new preview.
            </p>
            <p>
              <strong className="text-foreground">Revision limits →</strong>{" "}
              Standard and Premium tiers include up to 2 revision rounds.
              Additional rounds may incur a small fee.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
