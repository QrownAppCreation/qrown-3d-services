import Link from "next/link";
import { Heart, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "Style",    href: "/order/step1-style"    },
  { number: 2, label: "Products", href: "/order/step2-products" },
  { number: 3, label: "Colors",   href: "/order/step3-color"    },
  { number: 4, label: "Photos",   href: "/order/step3-photos"   },
  { number: 5, label: "Add-ons",  href: "/order/step4-addons"   },
  { number: 6, label: "Payment",  href: "/order/step5-payment"  },
];

interface WizardLayoutProps {
  currentStep: number;
  children: React.ReactNode;
}

export default function WizardLayout({ currentStep, children }: WizardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-5 w-5" style={{ color: "var(--wp-cta)", fill: "var(--wp-cta)" }} />
            <span className="font-bold text-lg" style={{ color: "var(--wp-charcoal)" }}>WedPrint</span>
          </Link>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </span>
        </div>

        {/* Step indicator bar */}
        <div className="border-t border-border">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex">
              {STEPS.map((step) => {
                const isComplete = step.number < currentStep;
                const isActive   = step.number === currentStep;
                return (
                  <div
                    key={step.number}
                    className={cn(
                      "flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors",
                      isActive   && "text-foreground",
                      isComplete && "text-green-600",
                      !isActive && !isComplete && "text-muted-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                        isActive   && "bg-primary text-primary-foreground",
                        isComplete && "bg-green-600 text-white",
                        !isActive && !isComplete && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isComplete ? <Check className="h-3.5 w-3.5" /> : step.number}
                    </div>
                    <span className="hidden sm:block">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-10">{children}</main>
    </div>
  );
}
