"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { formatCents } from "@/lib/order-pricing";

type RefundMode = "full" | "percent" | "flat" | "none";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  depositCents: number;
  paymentIntentId: string | null;
  onSuccess: () => void;
}

export default function OperatorCancelDialog({
  open,
  onOpenChange,
  orderId,
  depositCents,
  paymentIntentId,
  onSuccess,
}: Props) {
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<RefundMode>("full");
  const [percent, setPercent] = useState("50");
  const [flatDollars, setFlatDollars] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setReason("");
    setMode("full");
    setPercent("50");
    setFlatDollars("");
    setError(null);
  }

  async function handleConfirm() {
    const r = reason.trim();
    if (r.length < 3) {
      setError("Please enter a cancellation reason (at least 3 characters).");
      return;
    }

    let body: {
      reason: string;
      refundMode: RefundMode;
      percent?: number;
      flatCents?: number;
    } = { reason: r, refundMode: mode };

    if (mode === "percent") {
      const p = parseInt(percent, 10);
      if (Number.isNaN(p) || p < 1 || p > 100) {
        setError("Enter a percentage between 1 and 100.");
        return;
      }
      body = { ...body, percent: p };
    }
    if (mode === "flat") {
      const raw = flatDollars.replace(/[^0-9.]/g, "");
      const dollars = parseFloat(raw);
      if (Number.isNaN(dollars) || dollars < 0) {
        setError("Enter a valid dollar amount.");
        return;
      }
      body = { ...body, flatCents: Math.round(dollars * 100) };
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancellation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" showCloseButton>
        <DialogHeader>
          <DialogTitle>Cancel order &amp; refund</DialogTitle>
          <DialogDescription>
            Choose how much of the deposit to refund. The customer will receive an email with details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Deposit paid: </span>
            <span className="font-semibold" style={{ color: "var(--wp-charcoal)" }}>
              {formatCents(depositCents)}
            </span>
            {!paymentIntentId && (
              <p className="text-amber-700 text-xs mt-2">
                No Stripe payment on file — only &quot;No refund&quot; applies.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Cancellation reason *</Label>
            <textarea
              id="cancel-reason"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Explain why this order is being cancelled…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Refund option</Label>
            <div className="grid gap-2">
              {(
                [
                  ["full", "Full refund (100% of deposit)"],
                  ["percent", "Partial refund by % of deposit"],
                  ["flat", "Partial refund by dollar amount"],
                  ["none", "No refund (0%)"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-muted/50"
                >
                  <input
                    type="radio"
                    name="refundMode"
                    checked={mode === value}
                    onChange={() => setMode(value)}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {mode === "percent" && (
            <div className="space-y-2">
              <Label htmlFor="pct">Percent of deposit</Label>
              <Input
                id="pct"
                type="number"
                min={1}
                max={100}
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
              />
            </div>
          )}

          {mode === "flat" && (
            <div className="space-y-2">
              <Label htmlFor="flat">Refund amount (USD)</Label>
              <Input
                id="flat"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 25.00"
                value={flatDollars}
                onChange={(e) => setFlatDollars(e.target.value)}
              />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              "Confirm cancellation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
