"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import WizardLayout from "@/components/order/WizardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getOrderDraft,
  saveOrderDraft,
  calculateTotal,
  formatCents,
  ADDON_LABELS,
  ADDON_PRICES,
  type AddOnKey,
} from "@/lib/order-store";
import { ArrowLeft, CreditCard, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function Step5PaymentPage() {
  const router = useRouter();
  const [draft, setDraft] = useState(getOrderDraft());
  const [email, setEmail] = useState("");
  const [coupleName, setCoupleName] = useState("");
  const [loading, setLoading] = useState(false);
  // Synchronous ref guard — prevents a second request even if React hasn't
  // re-rendered the disabled button yet (e.g. fast double-click)
  const submittingRef = useRef(false);

  useEffect(() => {
    const d = getOrderDraft();
    setDraft(d);
    if (d.partner1Name && d.partner2Name) {
      setCoupleName(`${d.partner1Name} & ${d.partner2Name}`);
    }
  }, []);

  const pricing = calculateTotal(draft);

  async function handleCheckout() {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!coupleName) {
      toast.error("Please enter your names.");
      return;
    }

    // Synchronous guard fires before React re-renders the disabled button
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);

    try {
      const updatedDraft = saveOrderDraft({
        depositCents: pricing.deposit,
        totalCents: pricing.total,
      });

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: coupleName,
          draft: updatedDraft,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Could not create order");
      }

      const { checkoutUrl } = await res.json();
      // Navigate away — no need to reset loading or the ref
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
      // Reset so the user can try again after an error
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <WizardLayout currentStep={5}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Review & pay</h1>
          <p className="text-muted-foreground">
            Review your order below then pay a 50% deposit to get started. The
            balance is due on delivery.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_320px] gap-6">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
              <h2 className="font-semibold text-lg">Your details</h2>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  We&apos;ll send your order confirmation and design approval link here.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupleName">Names</Label>
                <Input
                  id="coupleName"
                  placeholder="Sarah & James"
                  value={coupleName}
                  onChange={(e) => setCoupleName(e.target.value)}
                />
              </div>
            </div>

            {/* What happens next */}
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="font-semibold text-lg mb-4">What happens next?</h2>
              <ol className="space-y-3">
                {[
                  "You pay the 50% deposit via Stripe (card or Apple/Google Pay)",
                  "Our team starts designing your piece within 24 hours",
                  "You receive a 3D preview to approve — fully interactive",
                  "Once approved, we print and contact you to arrange delivery",
                  "You pay the remaining balance on delivery",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Order summary */}
          <div className="md:sticky md:top-28 self-start space-y-4">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <h3 className="font-semibold mb-4">Order summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {draft.styleTier
                      ? `${draft.styleTier.charAt(0) + draft.styleTier.slice(1).toLowerCase()} cake topper`
                      : "Cake topper"}{" "}
                    ×{draft.quantity ?? 1}
                  </span>
                  <span>
                    {formatCents((draft.quantity ?? 1) * 7900)}
                  </span>
                </div>

                {draft.addOns &&
                  Object.entries(draft.addOns)
                    .filter(([, v]) => v)
                    .map(([key]) => {
                      const k = key as AddOnKey;
                      if (k === "RUSH_ORDER") return null;
                      return (
                        <div key={k} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {ADDON_LABELS[k]}
                          </span>
                          <span>
                            {formatCents(ADDON_PRICES[k] * (draft.quantity ?? 1))}
                          </span>
                        </div>
                      );
                    })}

                {pricing.rushSurcharge > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Rush surcharge</span>
                    <span>+{formatCents(pricing.rushSurcharge)}</span>
                  </div>
                )}

                <Separator className="my-2" />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCents(pricing.total)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between font-semibold text-base" style={{ color: "var(--wp-cta)" }}>
                  <span>Deposit due now</span>
                  <span>{formatCents(pricing.deposit)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Balance on delivery</span>
                  <span>{formatCents(pricing.balance)}</span>
                </div>
              </div>

              <Button
                className="w-full mt-5 gap-2"
                size="lg"
                onClick={handleCheckout}
                disabled={loading || !email}
              >
                <CreditCard className="h-4 w-4" />
                {loading ? "Redirecting..." : `Pay ${formatCents(pricing.deposit)} deposit`}
              </Button>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Secure payment via Stripe</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-start pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/order/step4-addons")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}
