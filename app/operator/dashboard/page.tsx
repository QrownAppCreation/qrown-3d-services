export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/order-store";
import {
  Heart,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth";

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

export default async function OperatorDashboardPage() {
  const orders = await db.order.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      couple: true,
      designs: true,
      addOns: true,
    },
  });

  const activeOrders = orders.filter(
    (o) => o.status !== "COMPLETE" && o.status !== "CANCELLED"
  );
  const designsAwaitingReview = orders.flatMap((o) =>
    o.designs.filter((d) => d.status === "REVIEW")
  ).length;
  const revenueThisMonth = orders
    .filter(
      (o) =>
        o.status !== "CANCELLED" &&
        o.createdAt > new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    )
    .reduce((sum, o) => sum + o.depositCents, 0);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Sidebar nav */}
      <div className="fixed left-0 top-0 bottom-0 w-56 bg-primary text-primary-foreground flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-current" />
            <span className="font-bold text-lg">WedPrint</span>
          </div>
          <p className="text-white/50 text-xs mt-1">Operator Dashboard</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {[
            { label: "Orders", href: "/operator/dashboard", icon: Package },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-sm font-medium"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-sm font-medium w-full text-white/70 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>

      {/* Main content */}
      <div className="pl-56">
        <header className="bg-white border-b border-border px-8 py-5">
          <h1 className="text-2xl font-bold">Order Queue</h1>
          <p className="text-muted-foreground text-sm">
            Manage all WedPrint orders
          </p>
        </header>

        <main className="p-8 space-y-6">
          {/* Metric cards */}
          <div className="grid grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-muted-foreground font-medium">
                  Active orders
                </span>
              </div>
              <p className="text-3xl font-bold">{activeOrders.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-muted-foreground font-medium">
                  Designs awaiting review
                </span>
              </div>
              <p className="text-3xl font-bold">{designsAwaitingReview}</p>
            </div>
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground font-medium">
                  Revenue this month
                </span>
              </div>
              <p className="text-3xl font-bold">
                {formatCents(revenueThisMonth)}
              </p>
            </div>
          </div>

          {/* Orders table */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">All orders</h2>
              <span className="text-sm text-muted-foreground">
                {orders.length} total
              </span>
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
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                        Order
                      </th>
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                        Couple
                      </th>
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                        Products
                      </th>
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                        Wedding date
                      </th>
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                        Deposit
                      </th>
                      <th className="text-right px-6 py-3 font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                          #{order.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{order.couple.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {order.couple.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {order.designs.map((d) => (
                              <span
                                key={d.id}
                                className="text-xs bg-muted px-2 py-0.5 rounded-full"
                              >
                                {d.category.replace("_", " ")} ×{d.quantity}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"
                            }`}
                          >
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {order.weddingDate
                            ? new Date(order.weddingDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {formatCents(order.depositCents)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/operator/orders/${order.id}`}>
                            <Button variant="outline" size="sm" className="gap-1.5">
                              <ExternalLink className="h-3.5 w-3.5" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
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
