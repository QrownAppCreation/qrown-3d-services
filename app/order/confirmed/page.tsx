import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, CheckCircle2, ArrowRight } from "lucide-react";

export default function OrderConfirmedPage() {
  return (
    <div className="min-h-screen wedding-gradient flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-3">You&apos;re all set!</h1>
          <p className="text-muted-foreground">
            Your order has been confirmed and your deposit received. We&apos;ll
            start designing within 24 hours and email you a 3D preview to
            approve.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 text-left space-y-3">
          <h2 className="font-semibold">What&apos;s next?</h2>
          <ul className="space-y-2">
            {[
              "Check your inbox — confirmation email on its way",
              "We'll design your custom piece within 24 hours",
              "You'll receive a 3D preview link to approve",
              "Once approved, we start printing!",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <Heart className="h-4 w-4 text-wedprint-rose fill-wedprint-rose flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button className="w-full gap-2" size="lg">
              Back to home
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
