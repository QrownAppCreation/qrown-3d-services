export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Package,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Zap,
  ArrowUpDown,
} from "lucide-react";
import { signOut } from "@/lib/auth";

// ── Constants ────────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 0,
  }).format(cents / 100);
}

/** Days from today until the given date. Negative = already passed. */
function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const today   = new Date(); today.setHours(0, 0, 0, 0);
  const target  = new Date(date); target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

interface TurnaroundProps { days: number | null }
function TurnaroundBadge({ days }: TurnaroundProps) {
  if (days === null) return null;
  if (days <= 0)
    return <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Wedding passed</span>;
  if (days < 7)
    return <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{days}d left</span>;
  if (days <= 14)
    return <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{days}d left</span>;
  return <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">{days}d left</span>;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function OperatorDashboardPage() {
  // Auth guard
  const session = await auth();
  if (!session || session.user.role !== "operator") redirect("/operator/login");

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const raw = await db.order.findMany({
    include: { couple: true, designs: true, addOns: true },
  });

  // ── Sort: rush first → wedding date asc (no date = Infinity) → createdAt asc
  const orders = [...raw].sort((a, b) => {
    const aRush = a.addOns.some((x) => x.type === "RUSH_ORDER");
    const bRush = b.addOns.some((x) => x.type === "RUSH_ORDER");
    if (aRush !== bRush) return aRush ? -1 : 1;

    const aDate = a.weddingDate ? new Date(a.weddingDate).getTime() : Infinity;
    const bDate = b.weddingDate ? new Date(b.weddingDate).getTime() : Infinity;
    if (aDate !== bDate) return aDate - bDate;

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const rushOrders     = orders.filter((o) => o.addOns.some((x) => x.type === "RUSH_ORDER"));
  const standardOrders = orders.filter((o) => !o.addOns.some((x) => x.type === "RUSH_ORDER"));

  // ── Metrics ───────────────────────────────────────────────────────────────
  const totalOrders  = orders.length;
  const paidOrders   = orders.filter((o) => !["PENDING_PAYMENT", "CANCELLED"].includes(o.status)).length;
  const monthStart   = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const revenueMonth = orders
    .filter((o) => o.status !== "CANCELLED" && o.createdAt >= monthStart)
    .reduce((sum, o) => sum + o.depositCents, 0);

  // ── Shared row renderer ───────────────────────────────────────────────────
  function OrderRow({ order }: { order: typeof orders[number] }) {
    const isRush = order.addOns.some((x) => x.type === "RUSH_ORDER");
    const days   = daysUntil(order.weddingDate);

    return (
      <tr className={`hover:bg-muted/20 transition-colors ${isRush ? "bg-orange-50/40" : ""}`}>
        {/* Order ID + rush badge */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">
              #{order.id.slice(-8).toUpperCase()}
            </span>
            {isRush ? (
              <span className="inline-flex items-center gap-0.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                <Zap className="h-2.5 w-2.5" />
                RUSH
              </span>
            ) : (
              <span className="inline-flex items-center text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                STD
              </span>
            )}
          </div>
        </td>

        {/* Couple */}
        <td className="px-5 py-4">
          <p className="font-medium">{order.couple.name}</p>
          <p className="text-muted-foreground text-xs">{order.couple.email}</p>
        </td>

        {/* Status */}
        <td className="px-5 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"
          }`}>
            {order.status.replace(/_/g, " ")}
          </span>
        </td>

        {/* Products */}
        <td className="px-5 py-4">
          <div className="flex flex-wrap gap-1">
            {order.designs.map((d) => (
              <span key={d.id} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {d.category.replace(/_/g, " ")} ×{d.quantity}
              </span>
            ))}
          </div>
        </td>

        {/* Deposit */}
        <td className="px-5 py-4 font-medium">{fmt(order.depositCents)}</td>

        {/* Wedding date + turnaround */}
        <td className="px-5 py-4">
          {order.weddingDate ? (
            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">
                {new Date(order.weddingDate).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </div>
              <TurnaroundBadge days={days} />
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>

        {/* Date ordered */}
        <td className="px-5 py-4 text-muted-foreground text-sm">
          {new Date(order.createdAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          })}
        </td>

        {/* Actions */}
        <td className="px-5 py-4 text-right">
          <Link href={`/operator/orders/${order.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              View
            </Button>
          </Link>
        </td>
      </tr>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <div className="fixed left-0 top-0 bottom-0 w-56 flex flex-col"
           style={{ backgroundColor: "var(--wp-charcoal)" }}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2 text-white">
            <Heart className="h-5 w-5 fill-current" />
            <span className="font-bold text-lg">WedPrint</span>
          </div>
          <p className="text-white/50 text-xs mt-1">Operator Dashboard</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/operator/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-sm font-medium text-white"
          >
            <Package className="h-4 w-4" />
            Orders
          </Link>
        </nav>

        <form
          className="p-3"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/operator/login" });
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-sm font-medium w-full text-white/60 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <div className="pl-56">
        <header className="bg-white border-b border-border px-8 py-5">
          <h1 className="text-2xl font-bold">Order Queue</h1>
          <p className="text-muted-foreground text-sm">Manage all WedPrint orders</p>
        </header>

        <main className="p-8 space-y-6">

          {/* ── Metric cards ── */}
          <div className="grid grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-muted-foreground font-medium">Total orders</span>
              </div>
              <p className="text-3xl font-bold">{totalOrders}</p>
              {rushOrders.length > 0 && (
                <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {rushOrders.length} rush
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground font-medium">Paid orders</span>
              </div>
              <p className="text-3xl font-bold">{paidOrders}</p>
            </div>

            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5" style={{ color: "var(--wp-gold)" }} />
                <span className="text-sm text-muted-foreground font-medium">Revenue this month</span>
              </div>
              <p className="text-3xl font-bold">{fmt(revenueMonth)}</p>
            </div>
          </div>

          {/* ── Orders table ── */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {/* Table header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-semibold">All orders</h2>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ArrowUpDown className="h-3 w-3" />
                  Sorted by: Rush first, then wedding date
                </span>
                <span className="text-sm text-muted-foreground">{orders.length} total</span>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No orders yet. They&apos;ll appear here when couples place them.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-5 py-3 font-medium text-muted-foreground">Order</th>
                      <th className="text-left px-5 py-3 font-medium text-muted-foreground">Couple</th>
                      <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-5 py-3 font-medium text-muted-foreground">Products</th>
                      <th className="text-left px-5 py-3 font-medium text-muted-foreground">Deposit</th>
                      <th className="text-left px-5 py-3 font-medium text-muted-foreground">Wedding date</th>
                      <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date ordered</th>
                      <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">

                    {/* ── Rush section ── */}
                    {rushOrders.length > 0 && (
                      <tr>
                        <td colSpan={8} className="px-5 py-2 bg-orange-50 border-b border-orange-100">
                          <div className="flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5 text-orange-500" />
                            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                              Rush Orders ({rushOrders.length})
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {rushOrders.map((order) => (
                      <OrderRow key={order.id} order={order} />
                    ))}

                    {/* ── Standard section ── */}
                    {standardOrders.length > 0 && (
                      <tr>
                        <td colSpan={8} className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Standard Orders ({standardOrders.length})
                          </span>
                        </td>
                      </tr>
                    )}
                    {standardOrders.map((order) => (
                      <OrderRow key={order.id} order={order} />
                    ))}

                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
