"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { OrderStatus } from "@prisma/client";

import { formatCents } from "@/lib/order-pricing";

interface Props {
  token: string;
  orderId: string;
  depositCents: number;
  createdAtIso: string;
  status: OrderStatus;
  paymentIntentId: string | null;
}

export default function CancelOrderButton({
  token,
  orderId,
  depositCents,
  createdAtIso,
  status,
  paymentIntentId,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (status === "CANCELLED" || status === "COMPLETE") {
    return null;
  }

  const created = new Date(createdAtIso).getTime();
  const elapsed = Date.now() - created;
  const ONE_HOUR = 60 * 60 * 1000;
  const DAY = 24 * 60 * 60 * 1000;

  const hasDeposit = !!paymentIntentId && status !== "PENDING_PAYMENT" && depositCents > 0;

  let policyPreview = "";
  if (!hasDeposit) {
    policyPreview =
      "No deposit was collected yet — your order will be cancelled without a refund.";
  } else if (elapsed < ONE_HOUR) {
    policyPreview = `Within 1 hour of ordering: full refund of ${formatCents(depositCents)}.`;
  } else if (elapsed < DAY) {
    policyPreview = `Between 1–24 hours: 50% refund (${formatCents(Math.round(depositCents * 0.5))}). The rest covers setup.`;
  } else {
    policyPreview =
      "After 24 hours: your deposit is non-refundable. You may still cancel your order.";
  }

  async function confirmCancel() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel-customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setMessage(data.message ?? "Order cancelled.");
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="px-6 py-4 border-t border-border bg-red-50/40">
        <p className="text-xs text-muted-foreground mb-2">Need to cancel?</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-red-200 text-red-700 hover:bg-red-50"
          onClick={() => {
            setOpen(true);
            setError(null);
            setMessage(null);
          }}
        >
          Cancel order
        </Button>
        {message && (
          <p className="text-sm text-green-700 mt-2">{message}</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription className="sr-only">
              Review refund policy and confirm cancellation
            </DialogDescription>
            <div className="space-y-3 text-sm text-muted-foreground pt-1">
              <p>
                <strong className="text-foreground">Our policy:</strong>
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Within 1 hour: full deposit refund</li>
                <li>1–24 hours: 50% refund (50% setup fee)</li>
                <li>After 24 hours: deposit non-refundable; order can still be cancelled</li>
              </ul>
              <p className="rounded-lg bg-muted/50 px-3 py-2 text-foreground/90">
                {policyPreview}
              </p>
            </div>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Keep order
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling…
                </>
              ) : (
                "Yes, cancel order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
