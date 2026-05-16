"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WizardLayout from "@/components/order/WizardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saveOrderDraft, getOrderDraft, type StyleTier } from "@/lib/order-store";
import { ArrowRight } from "lucide-react";
import { NotEdibleDisclaimer } from "@/components/NotEdibleDisclaimer";
import Image from "next/image";

const STYLE_TIERS: {
  id: StyleTier;
  name: string;
  description: string;
  emoji: string;
  examples: string;
  /** Optional product image to show alongside the style */
  image?: string;
}[] = [
  {
    id: "FUN",
    name: "Fun & Playful",
    description:
      "Bright, cartoon-like figures with exaggerated expressions and big smiles.",
    emoji: "🎉",
    examples: "Caricature-style, animated, expressive",
    image: "/images/Couple4/couple4-render.png", // START CHANGE — Couple 4 arms-crossed render fits Fun & Playful better (Session 3, May 16 2026)
  },
  {
    id: "ELEGANT",
    name: "Elegant & Formal",
    description:
      "Refined, realistic proportions. Clean lines, formal attire, timeless look.",
    emoji: "✨",
    examples: "Realistic proportions, formal dress, classic pose",
    image: "/images/hero-topper-header.png",
  },
  {
    id: "ROMANTIC",
    name: "Romantic & Classic",
    description:
      "Soft, flowing aesthetic. Gentle poses, romantic details, heirloom feel.",
    emoji: "🌹",
    examples: "Flowing gown, embracing pose, delicate features",
    image: "/images/couple3-render.png",
  },
  {
  {
    id: "ADVENTUROUS",
    name: "Adventurous & Themed",
    description:
      "Tell your story! Hiking gear, surfboards, nerdy references — your world, your way.",
    emoji: "🏔️",
    examples: "Hiking, beach, gaming, sports, fandom themes",
    image: "/images/Couple5/couple5-render-v2.png", // START CHANGE — Couple 5 walking render fills the emoji placeholder (Session 3, May 16 2026)
  },
  {
    id: "CUSTOM",
    name: "Custom Hybrid",
    description:
      "Something specific in mind that doesn't fit the categories above? Tell us.",
    emoji: "🎨",
    examples: "Mixed styles, unique requests, special concepts",
  },
];

export default function Step1StylePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<StyleTier | null>(null);

  useEffect(() => {
    const draft = getOrderDraft();
    if (draft.styleTier) setSelected(draft.styleTier);
  }, []);

  function handleNext() {
    if (!selected) return;
    saveOrderDraft({ styleTier: selected });
    router.push("/order/step2-products");
  }

  return (
    <WizardLayout currentStep={1}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">What&apos;s your vibe?</h1>
          <p className="text-muted-foreground">
            Choose the aesthetic that feels most like you two. This guides how
            we design your piece.
          </p>
          <div className="mt-4 max-w-xl">
            <NotEdibleDisclaimer />
          </div>
        </div>

        <div className="grid gap-4">
          {STYLE_TIERS.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelected(tier.id)}
              className={cn(
                "w-full text-left rounded-2xl border-2 p-5 transition-all hover:border-primary/50 hover:shadow-sm",
                selected === tier.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-white"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Show product image if available, otherwise emoji */}
                {tier.image ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={tier.image}
                      alt={`${tier.name} style example`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <span className="text-3xl mt-0.5">{tier.emoji}</span>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{tier.name}</h3>
                    {selected === tier.id && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">
                    {tier.description}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    {tier.examples}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!selected}
            className="gap-2 px-8"
          >
            Next: Choose products
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}
