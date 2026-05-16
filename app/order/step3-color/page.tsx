"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WizardLayout from "@/components/order/WizardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  saveOrderDraft,
  getOrderDraft,
  formatCents,
  COLOR_TIER_PRICES,
  type ColorTier,
} from "@/lib/order-store";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Image from "next/image";

const TIER_ORDER: ColorTier[] = ["CLASSIC", "DUO", "SIGNATURE", "HEIRLOOM"];

const TIER_PALETTE: Record<ColorTier, { bg: string; border: string; badge: string; dots: string[] }> = {
  CLASSIC:   { bg: "#F8F8F6", border: "#C9A84C", badge: "bg-gray-100 text-gray-600",    dots: ["#2C2C2A"] },
  DUO:       { bg: "#EEF2FF", border: "#6366F1", badge: "bg-blue-100 text-blue-700",    dots: ["#2C2C2A", "#C9A84C"] },
  SIGNATURE: { bg: "#F5F0FF", border: "#9333EA", badge: "bg-purple-100 text-purple-700", dots: ["#2C2C2A", "#C9A84C", "#C4622D"] },
  HEIRLOOM:  { bg: "#FFFBEB", border: "#C9A84C", badge: "bg-amber-100 text-amber-700",  dots: ["#2C2C2A", "#8B9D77", "#C9A84C", "#C4622D"] },
};

export default function Step3ColorPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<ColorTier>("CLASSIC");

  useEffect(() => {
    const draft = getOrderDraft();
    if (draft.colorTier) setSelected(draft.colorTier);
  }, []);

  function handleNext() {
    saveOrderDraft({ colorTier: selected });
    router.push("/order/step3-photos");
  }

  return (
    <WizardLayout currentStep={3}>
      <div className="space-y-8">
        <div>
          <div className="flex items-start gap-4">
            <div className="hidden sm:block w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
              <Image
                src="/images/couple3-final-print.png"
                alt="Example of a multi-color cake topper"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--wp-charcoal)" }}>
                Choose your color tier
              </h1>
              <p className="text-muted-foreground">
                More colors means more detail. Each tier is a different price.
                You can always start simple and upgrade later.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {TIER_ORDER.map((tier) => {
            const tierData = COLOR_TIER_PRICES[tier];
            const palette  = TIER_PALETTE[tier];
            const isActive = selected === tier;

            return (
              <button
                key={tier}
                onClick={() => setSelected(tier)}
                className={cn(
                  "rounded-2xl border-2 p-5 text-left transition-all w-full",
                  isActive ? "shadow-md" : "hover:shadow-sm"
                )}
                style={{
                  borderColor:      isActive ? palette.border : "var(--wp-border)",
                  backgroundColor:  isActive ? palette.bg     : "#ffffff",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-bold text-lg" style={{ color: "var(--wp-charcoal)" }}>
                        {tierData.label.toUpperCase()}
                      </h3>
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", palette.badge)}>
                        {tierData.colors === 4 ? "4+ colors" : `${tierData.colors} color${tierData.colors > 1 ? "s" : ""}`}
                      </span>
                      {/* Color dots */}
                      <div className="flex items-center gap-1">
                        {palette.dots.map((c, i) => (
                          <span key={i} className="w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                                style={{ backgroundColor: c }} />
                        ))}
                        {tier === "HEIRLOOM" && (
                          <span className="text-xs" style={{ color: "var(--wp-muted)" }}>+</span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm mb-3" style={{ color: "var(--wp-muted)" }}>
                      {tierData.description}
                    </p>

                    {/* Prices for all 4 products */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs">
                      <div>
                        <span style={{ color: "var(--wp-muted)" }}>Cake Topper</span>
                        <div className="font-semibold" style={{ color: "var(--wp-charcoal)" }}>
                          {formatCents(tierData.CAKE_TOPPER)}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: "var(--wp-muted)" }}>Bridal Gift</span>
                        <div className="font-semibold" style={{ color: "var(--wp-charcoal)" }}>
                          {formatCents(tierData.BRIDAL_GIFT)}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: "var(--wp-muted)" }}>Guest Favours</span>
                        <div className="font-semibold" style={{ color: "var(--wp-charcoal)" }}>
                          {formatCents(tierData.GUEST_FAVOR)}<span className="font-normal">/10</span>
                        </div>
                      </div>
                      <div>
                        <span style={{ color: "var(--wp-muted)" }}>Fridge Magnet</span>
                        <div className="font-semibold" style={{ color: "var(--wp-charcoal)" }}>
                          {formatCents(tierData.FRIDGE_MAGNET)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: checkmark */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all",
                      isActive ? "bg-primary border-primary" : "border-border bg-white"
                    )}
                  >
                    {isActive && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pricing page link */}
        <p className="text-sm text-center" style={{ color: "var(--wp-muted)" }}>
          Not sure which to choose?{" "}
          <a href="/pricing" target="_blank" rel="noopener noreferrer"
             className="underline" style={{ color: "var(--wp-sage)" }}>
            View our full pricing guide →
          </a>
        </p>

        <div className="flex justify-between pt-2">
          <Button
            variant="outline" size="lg"
            onClick={() => router.push("/order/step2-products")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button size="lg" onClick={handleNext} className="gap-2 px-8">
            Next: Upload photos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}
