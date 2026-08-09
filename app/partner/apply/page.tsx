"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, ArrowLeft, TrendingUp, Link2, Wallet } from "lucide-react";

/** Value props shown beside the form — mirrors ARCHITECTURE.md §8 Starter tier. */
const BENEFITS = [
  {
    icon: TrendingUp,
    title: "8% on every order",
    body: "Earn commission on each couple you send our way. No caps on order value.",
  },
  {
    icon: Link2,
    title: "Your own referral link",
    body: "One link to share in galleries, welcome guides, and client emails.",
  },
  {
    icon: Wallet,
    title: "Track everything",
    body: "A dashboard showing your orders, referred couples, and running balance.",
  },
];

export default function PartnerApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    referralSource: "",
  });

  const apply = trpc.partners.submitApplication.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error(err.message),
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.businessName.trim() || !form.contactName.trim() || !form.email.trim()) {
      toast.error("Business name, your name, and email are required.");
      return;
    }

    apply.mutate({
      businessName: form.businessName.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      // Empty optional strings are dropped so Zod's .optional() applies.
      phone: form.phone.trim() || undefined,
      website: form.website.trim() || undefined,
      referralSource: form.referralSource.trim() || undefined,
    });
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="min-h-screen bg-wp-ivory flex items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-wp-sage-light">
            <CheckCircle2 className="h-8 w-8" style={{ color: "var(--wp-sage)" }} />
          </div>
          <h1
            className="mb-3 text-3xl"
            style={{ fontFamily: "var(--font-syne)", color: "var(--wp-charcoal)" }}
          >
            Application received
          </h1>
          <p className="mb-8 leading-relaxed" style={{ color: "var(--wp-muted)" }}>
            Thanks, {form.contactName.split(" ")[0]}. We review every application by
            hand — usually within two business days. Watch your inbox at{" "}
            <strong style={{ color: "var(--wp-charcoal)" }}>{form.email}</strong> for
            your referral link and dashboard access.
          </p>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to WedPrint
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-wp-ivory px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm"
            style={{ color: "var(--wp-muted)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to WedPrint
          </Link>
          <span style={{ color: "var(--wp-border)" }}>·</span>
          <Link
            href="/partner/pricing"
            className="text-sm underline underline-offset-2"
            style={{ color: "var(--wp-muted)" }}
          >
            View all plans
          </Link>
        </div>

        <div className="grid gap-12 md:grid-cols-[1fr_400px]">
          {/* Pitch column */}
          <div>
            <p
              className="mb-3 text-xs uppercase tracking-[0.2em]"
              style={{ color: "var(--wp-gold)" }}
            >
              Partner Program
            </p>
            <h1
              className="mb-4 text-4xl leading-tight md:text-5xl"
              style={{ fontFamily: "var(--font-syne)", color: "var(--wp-charcoal)" }}
            >
              Give your couples a keepsake they&apos;ll never put away.
            </h1>
            <p
              className="mb-10 max-w-xl text-lg leading-relaxed"
              style={{ fontFamily: "var(--font-newsreader)", color: "var(--wp-muted)" }}
            >
              Photographers, planners, and bridal boutiques refer couples to
              WedPrint and earn on every order. You share a link — we handle the
              design, printing, and delivery.
            </p>

            <div className="space-y-6">
              {BENEFITS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-wp-sage-light">
                    <Icon className="h-5 w-5" style={{ color: "var(--wp-sage)" }} />
                  </div>
                  <div>
                    <h3
                      className="mb-1 font-semibold"
                      style={{ color: "var(--wp-charcoal)" }}
                    >
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--wp-muted)" }}>
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form column */}
          <div className="md:sticky md:top-16 self-start">
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm"
              style={{ borderColor: "var(--wp-border)" }}
            >
              <h2
                className="text-xl"
                style={{ fontFamily: "var(--font-syne)", color: "var(--wp-charcoal)" }}
              >
                Apply to partner
              </h2>

              <div className="space-y-2">
                <Label htmlFor="businessName">
                  Business name <span style={{ color: "var(--wp-cta)" }}>*</span>
                </Label>
                <Input
                  id="businessName"
                  placeholder="Rosewood Photography"
                  value={form.businessName}
                  onChange={(e) => set("businessName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactName">
                  Your name <span style={{ color: "var(--wp-cta)" }}>*</span>
                </Label>
                <Input
                  id="contactName"
                  placeholder="Alex Rivera"
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span style={{ color: "var(--wp-cta)" }}>*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@rosewoodphoto.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                />
                <p className="text-xs" style={{ color: "var(--wp-muted)" }}>
                  This becomes your dashboard login.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(305) 555-0142"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website or Instagram</Label>
                <Input
                  id="website"
                  placeholder="rosewoodphoto.com"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralSource">How did you hear about us?</Label>
                <Textarea
                  id="referralSource"
                  rows={3}
                  placeholder="A couple I photographed ordered a topper…"
                  value={form.referralSource}
                  onChange={(e) => set("referralSource", e.target.value)}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={apply.isPending}
              >
                {apply.isPending ? "Submitting…" : "Submit application"}
              </Button>

              <p className="text-center text-xs" style={{ color: "var(--wp-muted)" }}>
                Free to join. No monthly fee on the Starter tier.
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
