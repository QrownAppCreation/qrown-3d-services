"use client";

import { trpc } from "@/lib/trpc";
import { formatCents } from "@/lib/order-pricing";
import {
  PageHeader,
  StatCard,
  PartnerLoading,
  PartnerAccessNotice,
  EmptyState,
} from "@/components/partner/PartnerUI";

/** Ledger row styling per transaction type. */
const TXN_LABEL: Record<string, string> = {
  COMMISSION: "Commission",
  ADJUSTMENT: "Adjustment",
  WITHDRAWAL: "Payout",
};

export default function PartnerEarningsPage() {
  const { data, isLoading, error } = trpc.partners.getMyCredits.useQuery();

  if (isLoading) return <PartnerLoading />;
  if (error) return <PartnerAccessNotice message={error.message} />;
  if (!data) return null;

  return (
    <>
      <PageHeader
        title="Earnings"
        subtitle="Commission is credited when an order is marked complete."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Available balance"
          value={formatCents(data.balanceCents)}
          hint="Email us to request a payout"
          accent="sage"
        />
        <StatCard
          label="Total earned"
          value={formatCents(data.earnedCents)}
          accent="gold"
        />
        <StatCard label="Paid out" value={formatCents(data.withdrawnCents)} />
      </div>

      <h2
        className="mb-4 text-xl"
        style={{ fontFamily: "var(--font-syne)", color: "var(--wp-charcoal)" }}
      >
        Transaction history
      </h2>

      {data.transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          body="Your first commission lands here as soon as a referred order is completed."
        />
      ) : (
        <div
          className="overflow-hidden rounded-2xl border bg-white"
          style={{ borderColor: "var(--wp-border)" }}
        >
          {data.transactions.map((txn, i) => (
            <div
              key={txn.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
              style={{ borderTop: i === 0 ? "none" : "1px solid var(--wp-border)" }}
            >
              <div className="min-w-0">
                <p className="font-medium" style={{ color: "var(--wp-charcoal)" }}>
                  {TXN_LABEL[txn.type] ?? txn.type}
                  {txn.order?.couple?.name ? ` — ${txn.order.couple.name}` : ""}
                </p>
                <p className="truncate text-xs" style={{ color: "var(--wp-muted)" }}>
                  {new Date(txn.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {txn.note ? ` · ${txn.note}` : ""}
                </p>
              </div>
              <span
                className="flex-shrink-0 font-semibold"
                style={{
                  // Credits in sage, debits in the CTA orange.
                  color: txn.amountCents >= 0 ? "var(--wp-sage)" : "var(--wp-cta)",
                }}
              >
                {txn.amountCents >= 0 ? "+" : "−"}
                {formatCents(Math.abs(txn.amountCents))}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
