"use client";

import { trpc } from "@/lib/trpc";
import {
  PageHeader,
  PartnerLoading,
  PartnerAccessNotice,
  EmptyState,
} from "@/components/partner/PartnerUI";

export default function PartnerCustomersPage() {
  const { data, isLoading, error } = trpc.partners.getMyCustomers.useQuery();

  if (isLoading) return <PartnerLoading />;
  if (error) return <PartnerAccessNotice message={error.message} />;
  if (!data) return null;

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle={`${data.length} couple${data.length === 1 ? "" : "s"} referred by you`}
      />

      {data.length === 0 ? (
        <EmptyState
          title="No referred couples yet"
          body="Couples are added here the first time they place an order through your referral link."
        />
      ) : (
        <div
          className="overflow-x-auto rounded-2xl border bg-white"
          style={{ borderColor: "var(--wp-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--wp-border)" }}>
                {["Couple", "Email", "First order", "Source"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "var(--wp-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((customer) => (
                <tr key={customer.id} style={{ borderTop: "1px solid var(--wp-border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--wp-charcoal)" }}>
                    {customer.name ?? "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--wp-muted)" }}>
                    {customer.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--wp-muted)" }}>
                    {customer.firstOrderAt
                      ? new Date(customer.firstOrderAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor: "var(--wp-sage-light)",
                        color: "var(--wp-charcoal)",
                      }}
                    >
                      {customer.source.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
