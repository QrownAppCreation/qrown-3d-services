"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { formatCents } from "@/lib/order-pricing";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  PartnerLoading,
  PartnerAccessNotice,
  EmptyState,
  StatusBadge,
} from "@/components/partner/PartnerUI";

export default function PartnerOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = trpc.partners.getMyOrders.useQuery({
    page,
    limit: 20,
  });

  if (isLoading) return <PartnerLoading />;
  if (error) return <PartnerAccessNotice message={error.message} />;
  if (!data) return null;

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={`${data.total} order${data.total === 1 ? "" : "s"} placed through your referral link`}
      />

      {data.orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          body="Once a couple orders through your referral link, their order and your commission appear here."
        />
      ) : (
        <>
          <div
            className="overflow-x-auto rounded-2xl border bg-white"
            style={{ borderColor: "var(--wp-border)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--wp-border)" }}>
                  {["Order", "Couple", "Placed", "Status", "Total", "Your commission"].map(
                    (h, i) => (
                      <th
                        key={h}
                        // Money columns right-align; the rest left-align.
                        className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                          i >= 4 ? "text-right" : "text-left"
                        }`}
                        style={{ color: "var(--wp-muted)" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr key={order.id} style={{ borderTop: "1px solid var(--wp-border)" }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--wp-muted)" }}>
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--wp-charcoal)" }}>
                      <p className="font-medium">{order.couple.name}</p>
                      <p className="text-xs" style={{ color: "var(--wp-muted)" }}>
                        {order.couple.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--wp-muted)" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right" style={{ color: "var(--wp-charcoal)" }}>
                      {formatCents(order.totalCents)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      <span
                        style={{
                          // Grey out commission that hasn't been earned yet.
                          color:
                            order.status === "COMPLETE"
                              ? "var(--wp-sage)"
                              : "var(--wp-muted)",
                        }}
                      >
                        {formatCents(order.commissionCents)}
                      </span>
                      {order.status !== "COMPLETE" && (
                        <p className="text-[10px] font-normal" style={{ color: "var(--wp-muted)" }}>
                          pending
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm" style={{ color: "var(--wp-muted)" }}>
                Page {data.page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
