"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WizardLayout from "@/components/order/WizardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  saveOrderDraft,
  getOrderDraft,
  calculateTotal,
  formatCents,
  ADDON_LABELS,
  ADDON_PRICES,
  type AddOnKey,
} from "@/lib/order-store";
import { ArrowLeft, ArrowRight, Plus, Minus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AddOnConfig {
  key: AddOnKey;
  description: string;
  detail: string;
  emoji: string;
}

const ADD_ONS: AddOnConfig[] = [
  {
    key: "HAND_PAINTING",
    description: "Each piece hand-painted by our artist",
    detail: "Adds colour, detail, and that heirloom finish",
    emoji: "🎨",
  },
  {
    key: "GIFT_BOX",
    description: "Presentation box with ribbon",
    detail: "Perfect for gifting. Acid-free tissue inside",
    emoji: "🎁",
  },
  {
    key: "ENGRAVED_BASE",
    description: "Names & date engraved on the base",
    detail: "Laser-engraved, permanent and elegant",
    emoji: "✍️",
  },
  {
    key: "RUSH_ORDER",
    description: "Rush order — ready in 72 hours",
    detail: "50% surcharge added to your order total",
    emoji: "⚡",
  },
  {
    key: "STL_LICENSE",
    description: "Digital STL file licence",
    detail: "Keep the 3D file forever. Print again any time",
    emoji: "💾",
  },
];

export default function Step4AddonsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Partial<Record<AddOnKey, boolean>>>(
    {}
  );
  const [draft, setDraft] = useState(getOrderDraft());

  useEffect(() => {
    const d = getOrderDraft();
    setDraft(d);
    if (d.addOns) setSelected(d.addOns);
  }, []);

  function toggleAddOn(key: AddOnKey) {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const pricing = calculateTotal({ ...draft, addOns: selected });

  function handleNext() {
    saveOrderDraft({ addOns: selected });
    router.push("/order/step5-payment");
  }

  return (
    <WizardLayout currentStep={5}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Finishing touches</h1>
          <p className="text-muted-foreground">
            Optional upgrades to make your piece even more special.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_280px] gap-6">
          {/* Add-on list */}
          <div className="space-y-3">
            {ADD_ONS.map((addon) => {
              const isSelected = !!selected[addon.key];
              const price =
                addon.key === "RUSH_ORDER"
                  ? `+50% surcharge`
                  : `+${formatCents(ADDON_PRICES[addon.key])} per piece`;

              return (
                <button
                  key={addon.key}
                  onClick={() => toggleAddOn(addon.key)}
                  className={cn(
                    "w-full text-left rounded-2xl border-2 p-4 transition-all hover:shadow-sm",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-white hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{addon.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{ADDON_LABELS[addon.key]}</p>
                        <p className="text-sm font-semibold text-wedprint-rose">
                          {price}
                        </p>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {addon.description}
                      </p>
                      <p className="text-xs text-muted-foreground italic mt-0.5">
                        {addon.detail}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40"
                      )}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Price summary */}
          <div className="md:sticky md:top-28 self-start">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <h3 className="font-semibold mb-4">Order summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Cake topper ×{draft.quantity ?? 1}
                  </span>
                  <span>
                    {formatCents(
                      (draft.quantity ?? 1) * 7900
                    )}
                  </span>
                </div>

                {Object.entries(selected)
                  .filter(([, v]) => v)
                  .map(([key]) => {
                    const k = key as AddOnKey;
                    if (k === "RUSH_ORDER") return null;
                    return (
                      <div key={k} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {ADDON_LABELS[k]} ×{draft.quantity ?? 1}
                        </span>
                        <span>
                          {formatCents(ADDON_PRICES[k] * (draft.quantity ?? 1))}
                        </span>
                      </div>
                    );
                  })}

                {pricing.rushSurcharge > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Rush surcharge (50%)</span>
                    <span>+{formatCents(pricing.rushSurcharge)}</span>
                  </div>
                )}

                <Separator className="my-2" />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCents(pricing.total)}</span>
                </div>

                <Separator className="my-1" />

                <div className="flex justify-between text-wedprint-rose font-medium">
                  <span>Deposit due now</span>
                  <span>{formatCents(pricing.deposit)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Balance on delivery</span>
                  <span>{formatCents(pricing.balance)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/order/step3-photos")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button size="lg" onClick={handleNext} className="gap-2 px-8">
            Next: Payment
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}
