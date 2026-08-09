"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/order-pricing";
import { Handshake, Check, Ban, Loader2 } from "lucide-react";
import { toast } from "sonner";

/** Status pill colors for the partner lifecycle. */
const STATUS_STYLE: Record<string, string> = {
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-gray-100 text-gray-600",
  REJECTED: "bg-red-100 text-red-600",
};

/**
 * Partner approval + roster panel for the operator dashboard.
 *
 * Client component using tRPC so approvals happen without a page reload;
 * the list invalidates itself after every mutation.
 */
export function PartnerApprovalQueue() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data: partners, isLoading } = trpc.admin.listPartners.useQuery();

  const approve = trpc.admin.approvePartner.useMutation({
    onSuccess: async (partner) => {
      toast.success(`${partner.businessName} approved — welcome email sent.`);
      await utils.admin.listPartners.invalidate();
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => setBusyId(null),
  });

  const suspend = trpc.admin.suspendPartner.useMutation({
    onSuccess: async (partner) => {
      toast.success(`${partner.businessName} set to ${partner.status.toLowerCase()}.`);
      await utils.admin.listPartners.invalidate();
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => setBusyId(null),
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading partners…
      </div>
    );
  }

  if (!partners || partners.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
        <p className="text-sm text-gray-500">
          No partner applications yet. Share{" "}
          <span className="font-mono text-gray-700">/partner/apply</span> with
          photographers and planners.
        </p>
      </div>
    );
  }

  const pending = partners.filter((p) => p.status === "PENDING_APPROVAL");

  return (
    <div className="space-y-3">
      {pending.length > 0 && (
        <p className="text-sm font-medium text-amber-700">
          {pending.length} application{pending.length === 1 ? "" : "s"} awaiting review
        </p>
      )}

      {partners.map((partner) => (
        <div
          key={partner.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-900">{partner.businessName}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  STATUS_STYLE[partner.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {partner.status.replace(/_/g, " ")}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                {partner.planKey} · {(partner.commissionBps / 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {partner.contactName} · {partner.email}
              {partner.website ? ` · ${partner.website}` : ""}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              /?ref={partner.slug} · {partner._count.orders} order
              {partner._count.orders === 1 ? "" : "s"} · {partner._count.customers} customer
              {partner._count.customers === 1 ? "" : "s"} · balance{" "}
              {formatCents(partner.creditBalanceCents)}
            </p>
            {partner.referralSource && (
              <p className="mt-1.5 text-xs italic text-gray-500">
                &ldquo;{partner.referralSource}&rdquo;
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {partner.status !== "ACTIVE" && (
              <Button
                size="sm"
                className="gap-1.5"
                disabled={busyId === partner.id}
                onClick={() => {
                  setBusyId(partner.id);
                  approve.mutate({ partnerId: partner.id });
                }}
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </Button>
            )}
            {partner.status !== "SUSPENDED" && partner.status !== "REJECTED" && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={busyId === partner.id}
                onClick={() => {
                  setBusyId(partner.id);
                  // Pending applications are rejected; live partners are suspended.
                  suspend.mutate({
                    partnerId: partner.id,
                    status:
                      partner.status === "PENDING_APPROVAL" ? "REJECTED" : "SUSPENDED",
                  });
                }}
              >
                <Ban className="h-3.5 w-3.5" />
                {partner.status === "PENDING_APPROVAL" ? "Reject" : "Suspend"}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Section wrapper with heading — drop straight into the operator dashboard. */
export function PartnerApprovalSection() {
  return (
    <section id="partners" className="mt-12">
      <div className="mb-4 flex items-center gap-2">
        <Handshake className="h-5 w-5 text-gray-400" />
        <h2 className="text-xl font-bold text-gray-900">Partners</h2>
      </div>
      <PartnerApprovalQueue />
    </section>
  );
}
