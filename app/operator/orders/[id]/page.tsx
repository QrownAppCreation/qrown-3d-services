export const dynamic = "force-dynamic";

import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Zap, Layers } from "lucide-react";

const COLOR_TIER_BADGE: Record<string, string> = {
  CLASSIC:   "bg-gray-100 text-gray-700 border border-gray-200",
  DUO:       "bg-blue-100 text-blue-700 border border-blue-200",
  SIGNATURE: "bg-purple-100 text-purple-700 border border-purple-200",
  HEIRLOOM:  "bg-amber-100 text-amber-800 border border-amber-200",
};

const COLOR_TIER_FILAMENT: Record<string, string> = {
  CLASSIC:   "1 filament — no changes needed",
  DUO:       "2 filaments — 1 change",
  SIGNATURE: "3 filaments — 2 changes (Bambu X1C only)",
  HEIRLOOM:  "4+ filaments — 3+ changes (Bambu X1C only)",
};
import OrderDetailClient from "./OrderDetailClient";

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OperatorOrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "operator") {
    redirect("/operator/login");
  }

  const { id } = await params;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function daysUntil(date: Date | null): number | null {
    if (!date) return null;
    const today  = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(date); target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
  }

  const order = await db.order.findUnique({
    where: { id },
    include: {
      couple: true,
      designs: {
        include: { printJobs: true },
      },
      addOns: true,
    },
  });

  if (!order) notFound();

  const isRush      = order.addOns.some((a) => a.type === "RUSH_ORDER");
  const colorTier   = order.colorTier as string;
  const needsX1C    = colorTier === "SIGNATURE" || colorTier === "HEIRLOOM";
  const days   = daysUntil(order.weddingDate);

  // Turnaround badge config
  let turnaroundEl: React.ReactNode = null;
  if (days !== null) {
    if (days <= 0)
      turnaroundEl = <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">Wedding passed</span>;
    else if (days < 7)
      turnaroundEl = <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">{days} days until wedding</span>;
    else if (days <= 14)
      turnaroundEl = <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">{days} days until wedding</span>;
    else
      turnaroundEl = <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">{days} days until wedding</span>;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-56 flex flex-col text-white" style={{ backgroundColor: "var(--wp-charcoal)" }}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-current" />
            <span className="font-bold text-lg">WedPrint</span>
          </div>
          <p className="text-white/50 text-xs mt-1">Operator Dashboard</p>
        </div>
        <nav className="flex-1 p-3">
          <Link
            href="/operator/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
        </nav>
      </div>

      {/* Main */}
      <div className="pl-56">
        {/* Rush alert banner — only shown for expedited orders */}
        {isRush && (
          <div className="bg-orange-500 text-white px-8 py-3 flex items-center gap-3">
            <Zap className="h-5 w-5 flex-shrink-0" />
            <div>
              <span className="font-bold text-sm tracking-wide">RUSH ORDER</span>
              <span className="text-orange-100 text-sm ml-2">
                — This order has the Rush add-on selected. Prioritise it in the production queue.
              </span>
            </div>
          </div>
        )}

        {/* Color tier / filament prep banner */}
        <div className={`px-8 py-3 flex items-center gap-3 ${needsX1C ? "bg-purple-50 border-b border-purple-100" : "bg-gray-50 border-b border-gray-100"}`}>
          <Layers className={`h-4 w-4 flex-shrink-0 ${needsX1C ? "text-purple-500" : "text-gray-400"}`} />
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${COLOR_TIER_BADGE[colorTier] ?? "bg-muted text-muted-foreground"}`}>
              {colorTier} TIER
            </span>
            <span className={`text-xs ${needsX1C ? "text-purple-700 font-medium" : "text-gray-500"}`}>
              {COLOR_TIER_FILAMENT[colorTier] ?? "—"}
            </span>
            {needsX1C && (
              <span className="text-xs font-semibold text-white bg-purple-600 px-2 py-0.5 rounded">
                Route to Bambu X1C
              </span>
            )}
          </div>
        </div>

        <header className={`bg-white border-b border-border px-8 py-5 ${isRush ? "border-t-2 border-t-orange-400" : ""}`}>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">
              Order #{id.slice(-8).toUpperCase()}
            </h1>
            {isRush && (
              <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                <Zap className="h-3 w-3" />
                RUSH
              </span>
            )}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
            {turnaroundEl}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {order.couple.name} — {order.couple.email}
          </p>
          {order.status === "CANCELLED" && order.cancelledAt && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
              <p className="font-semibold text-red-800">Cancellation record</p>
              <p className="text-red-900/90 mt-1">
                Cancelled {new Date(order.cancelledAt).toLocaleString()}
                {order.cancelledBy && ` · ${order.cancelledBy === "operator" ? "Operator" : "Customer"}`}
              </p>
              {order.refundAmountCents != null && (
                <p className="text-red-900/90 mt-1">
                  Refund issued: {fmt(order.refundAmountCents)}
                </p>
              )}
              {order.cancellationReason && (
                <p className="text-red-900/80 mt-2 italic">&ldquo;{order.cancellationReason}&rdquo;</p>
              )}
            </div>
          )}
        </header>

        <main className="p-8 space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Couple info */}
            <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
              <h2 className="font-semibold">Couple details</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  <span className="font-medium">{order.couple.name}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <a
                    href={`mailto:${order.couple.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {order.couple.email}
                  </a>
                </p>
                {order.couple.phone && (
                  <p>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    {order.couple.phone}
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Tier:</span>{" "}
                  <Badge variant="outline">{order.couple.tier}</Badge>
                </p>
              </div>
            </div>

            {/* Order details */}
            <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
              <h2 className="font-semibold">Order details</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Order date:</span>{" "}
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </p>
                {order.weddingDate && (
                  <p>
                    <span className="text-muted-foreground">Wedding date:</span>{" "}
                    {new Date(order.weddingDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
                {order.colorPalette && (
                  <p>
                    <span className="text-muted-foreground">
                      Colour palette:
                    </span>{" "}
                    {order.colorPalette}
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Style tier:</span>{" "}
                  {order.styleTier}
                </p>
                {order.styleNotes && (
                  <div>
                    <p className="text-muted-foreground mb-1">Notes:</p>
                    <p className="bg-muted/40 rounded-lg p-3 italic">
                      {order.styleNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
              <h2 className="font-semibold">Payment</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deposit paid:</span>
                  <span className="font-medium text-green-700">
                    {fmt(order.depositCents)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance due:</span>
                  <span className="font-medium">
                    {fmt(order.balanceCents)}
                  </span>
                </div>
                {order.stripePaymentId && (
                  <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                    Stripe: {order.stripePaymentId.slice(0, 24)}...
                  </p>
                )}
              </div>

              {order.addOns.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-sm font-medium mb-2">Add-ons</p>
                  <div className="space-y-1">
                    {order.addOns.map((a) => (
                      <div
                        key={a.id}
                        className="flex justify-between text-xs text-muted-foreground"
                      >
                        <span>{a.type.replace(/_/g, " ")}</span>
                        <span>{fmt(a.priceCents)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Designs + complete button */}
          <OrderDetailClient
            order={{
              id:               order.id,
              status:           order.status,
              balanceCents:     order.balanceCents,
              depositCents:     order.depositCents,
              coupleEmail:      order.couple.email,
              coupleName:       order.couple.name,
              stripePaymentId:  order.stripePaymentId ?? null,
              designs:          order.designs,
            }}
          />
        </main>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT:   "bg-gray-100 text-gray-600",
  PAID:              "bg-green-100 text-green-700",
  IN_DESIGN:         "bg-blue-100 text-blue-700",
  AWAITING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED:          "bg-green-100 text-green-700",
  BALANCE_PAID:      "bg-indigo-100 text-indigo-700",
  PRINTING:          "bg-cyan-100 text-cyan-700",
  COMPLETE:          "bg-purple-100 text-purple-700",
  CANCELLED:         "bg-red-100 text-red-600",
};
