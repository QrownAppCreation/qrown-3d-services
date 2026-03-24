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
  BASE_PRICES,
} from "@/lib/order-store";
import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";

const SIZES = [
  { value: "small", label: "Small (10cm)", priceMod: 0 },
  { value: "standard", label: "Standard (14cm)", priceMod: 1000 },
  { value: "large", label: "Large (18cm)", priceMod: 2000 },
];

export default function Step2ProductsPage() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [sizeCm, setSizeCm] = useState("standard");

  useEffect(() => {
    const draft = getOrderDraft();
    if (draft.quantity) setQuantity(draft.quantity);
    if (draft.sizeCm) setSizeCm(draft.sizeCm);
  }, []);

  const sizeModifier =
    SIZES.find((s) => s.value === sizeCm)?.priceMod ?? 0;
  const pricePerUnit = BASE_PRICES.CAKE_TOPPER + sizeModifier;
  const total = pricePerUnit * quantity;

  function handleNext() {
    saveOrderDraft({ quantity, sizeCm });
    router.push("/order/step3-photos");
  }

  return (
    <WizardLayout currentStep={2}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your cake topper</h1>
          <p className="text-muted-foreground">
            For the MVP we&apos;re focused on perfecting cake toppers. Choose
            your size and quantity below.
          </p>
        </div>

        {/* Product card */}
        <div className="border-2 border-primary rounded-2xl p-6 bg-primary/5">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🎂</span>
            <div className="flex-1">
              <h3 className="font-semibold text-xl mb-1">Custom Cake Topper</h3>
              <p className="text-muted-foreground text-sm mb-4">
                A personalised 3D printed miniature of you two, designed from
                your photos. Printed in food-safe PLA with optional hand-painted
                finish.
              </p>

              {/* Size selector */}
              <div className="mb-5">
                <p className="text-sm font-medium mb-2">Size</p>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setSizeCm(size.value)}
                      className={cn(
                        "rounded-xl border-2 py-2.5 px-3 text-sm font-medium transition-all",
                        sizeCm === size.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-white hover:border-primary/50"
                      )}
                    >
                      <div>{size.label.split(" ")[0]}</div>
                      <div className="text-xs opacity-70">
                        {size.label.split(" ")[1]}
                      </div>
                      {size.priceMod > 0 && (
                        <div className="text-xs mt-0.5">
                          +{formatCents(size.priceMod)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Quantity</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center font-semibold text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="w-9 h-9 rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Price summary */}
          <div className="mt-5 pt-5 border-t border-border/60 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {formatCents(pricePerUnit)} × {quantity}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatCents(total)}</p>
              <p className="text-xs text-muted-foreground">
                50% deposit = {formatCents(Math.round(total * 0.5))} today
              </p>
            </div>
          </div>
        </div>

        {/* Coming soon */}
        <div className="rounded-xl bg-muted/50 border border-dashed p-4">
          <p className="text-sm text-muted-foreground text-center">
            Bridal party gifts, guest favours, and fridge magnets coming soon!
          </p>
        </div>

        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/order/step1-style")}
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
