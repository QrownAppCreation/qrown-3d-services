export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/order-store";
import { ArrowLeft, Heart } from "lucide-react";
import OrderDetailClient from "./OrderDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OperatorOrderDetailPage({ params }: Props) {
  const { id } = await params;

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

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-56 bg-primary text-primary-foreground flex flex-col">
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
        <header className="bg-white border-b border-border px-8 py-5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              Order #{id.slice(-8).toUpperCase()}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {order.couple.name} — {order.couple.email}
          </p>
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
                    {formatCents(order.depositCents)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance due:</span>
                  <span className="font-medium">
                    {formatCents(order.balanceCents)}
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
                        <span>{formatCents(a.priceCents)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Designs */}
          <OrderDetailClient order={order} />
        </main>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  IN_DESIGN: "bg-purple-100 text-purple-800",
  AWAITING_APPROVAL: "bg-orange-100 text-orange-800",
  APPROVED: "bg-green-100 text-green-800",
  PRINTING: "bg-cyan-100 text-cyan-800",
  COMPLETE: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
};
