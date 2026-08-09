"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { formatCents } from "@/lib/order-pricing";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  StatCard,
  PartnerLoading,
  PartnerAccessNotice,
  EmptyState,
  StatusBadge,
} from "@/components/partner/PartnerUI";
import { Copy, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function PartnerDashboardPage() {
  const [copied, setCopied] = useState(false);
  const { data, isLoading, error } = trpc.partners.getMyDashboard.useQuery();

  if (isLoading) return <PartnerLoading />;
  if (error) return <PartnerAccessNotice message={error.message} />;
  if (!data) return null;

  const { partner, stats, recentOrders } = data;

  // Built client-side so it always matches the domain the partner is on.
  const referralUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${partner.slug}`
      : `/?ref=${partner.slug}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — select the link and copy manually.");
    }
  }

  return (
    <>
      <PageHeader
        title={partner.businessName}
        subtitle={`${partner.planKey.charAt(0) + partner.planKey.slice(1).toLowerCase()} plan · ${(partner.commissionBps / 100).toFixed(0)}% commission`}
      />

      {/* Referral link — the single most important thing on this page */}
      <div
        className="mb-8 rounded-2xl border p-6"
        style={{
          borderColor: "var(--wp-border)",
          backgroundColor: "var(--wp-sage-light)",
        }}
      >
        <p
          className="mb-3 text-[11px] uppercase tracking-[0.16em]"
          style={{ color: "var(--wp-muted)" }}
        >
          Your referral link
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <code
            className="flex-1 overflow-x-auto rounded-lg bg-white px-4 py-3 text-sm"
            style={{ color: "var(--wp-charcoal)" }}
          >
            {referralUrl}
          </code>
          <Button onClick={copyLink} className="gap-2 sm:w-auto">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
        <p className="mt-3 text-xs" style={{ color: "var(--wp-muted)" }}>
          Any couple who orders within 30 days of clicking this link is credited to you.
        </p>
      </div>

      {/* Headline numbers */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Available balance"
          value={formatCents(partner.creditBalanceCents)}
          hint="Ready to withdraw"
          accent="sage"
        />
        <StatCard
          label="Lifetime commission"
          value={formatCents(stats.lifetimeCommissionCents)}
          hint={`${stats.completedOrders} completed order${stats.completedOrders === 1 ? "" : "s"}`}
          accent="gold"
        />
        <StatCard
          label="In the pipeline"
          value={formatCents(stats.pipelineCommissionCents)}
          hint={`${stats.activeOrders} order${stats.activeOrders === 1 ? "" : "s"} in progress`}
        />
        <StatCard
          label="This month"
          value={
            stats.monthlyOrderLimit === null
              ? `${stats.ordersThisMonth}`
              : `${stats.ordersThisMonth} / ${stats.monthlyOrderLimit}`
          }
          hint={
            stats.monthlyOrderLimit === null
              ? "Unlimited orders"
              : "Starter plan monthly limit"
          }
        />
      </div>

      {/* Recent orders */}
      <div className="mb-4 flex items-center justify-between">
        <h2
          className="text-xl"
          style={{ fontFamily: "var(--font-syne)", color: "var(--wp-charcoal)" }}
        >
          Recent orders
        </h2>
        {recentOrders.length > 0 && (
          <Link
            href="/partner/orders"
            className="inline-flex items-center gap-1 text-sm"
            style={{ color: "var(--wp-cta)" }}
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {recentOrders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          body="Share your referral link with couples you're working with. Orders placed through it show up here automatically."
          action={
            <Button onClick={copyLink} variant="outline" className="gap-2">
              <Copy className="h-4 w-4" />
              Copy referral link
            </Button>
          }
        />
      ) : (
        <div
          className="overflow-hidden rounded-2xl border bg-white"
          style={{ borderColor: "var(--wp-border)" }}
        >
          {recentOrders.map((order, i) => (
            <div
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              // Divider on every row but the first.
              style={{
                borderTop: i === 0 ? "none" : "1px solid var(--wp-border)",
              }}
            >
              <div>
                <p className="font-medium" style={{ color: "var(--wp-charcoal)" }}>
                  {order.couple.name}
                </p>
                <p className="text-xs" style={{ color: "var(--wp-muted)" }}>
                  #{order.id.slice(-8).toUpperCase()} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold" style={{ color: "var(--wp-charcoal)" }}>
                  {formatCents(order.depositCents + order.balanceCents)}
                </span>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
