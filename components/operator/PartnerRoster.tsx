"use client";

/**
 * PartnerRoster — full partner management UI for the operator portal.
 *
 * Features:
 *  - Tabs: All | Pending | Active | Suspended/Rejected
 *  - Per-partner: approve, reject/suspend, change plan, record payout
 *  - All mutations call tRPC and invalidate the list on success — no reload needed.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/order-pricing";
import { Check, Ban, DollarSign, Loader2, Handshake } from "lucide-react";
import { toast } from "sonner";

// ── Constants ─────────────────────────────────────────────────────────────────

const PLANS = ["STARTER", "PROFESSIONAL", "STUDIO", "ENTERPRISE"] as const;
type Plan = (typeof PLANS)[number];

/** Default commission in basis points per plan — mirrors lib/partner.ts. */
const DEFAULT_BPS: Record<Plan, number> = {
  STARTER: 800,
  PROFESSIONAL: 1200,
  STUDIO: 1800,
  ENTERPRISE: 1800,
};

const STATUS_STYLE: Record<string, string> = {
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  ACTIVE:           "bg-green-100 text-green-700",
  SUSPENDED:        "bg-gray-100 text-gray-600",
  REJECTED:         "bg-red-100 text-red-600",
};

type Tab = "all" | "pending" | "active" | "suspended";

// ── Component ─────────────────────────────────────────────────────────────────

export function PartnerRoster() {
  const [tab, setTab]               = useState<Tab>("all");
  const [busyId, setBusyId]         = useState<string | null>(null);
  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedPlan, setSelectedPlan]     = useState<Plan>("STARTER");
  const [customBps, setCustomBps]           = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: allPartners = [], isLoading } = trpc.admin.listPartners.useQuery();

  // ── Mutations ──────────────────────────────────────────────────────────────

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
      toast.success(
        `${partner.businessName} set to ${partner.status.toLowerCase().replace(/_/g, " ")}.`
      );
      await utils.admin.listPartners.invalidate();
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => setBusyId(null),
  });

  const updatePlan = trpc.admin.updatePartnerPlan.useMutation({
    onSuccess: async (partner) => {
      toast.success(`Plan updated to ${partner.planKey}.`);
      setEditPlanId(null);
      await utils.admin.listPartners.invalidate();
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => setBusyId(null),
  });

  const recordWithdrawal = trpc.admin.recordPartnerWithdrawal.useMutation({
    onSuccess: async () => {
      toast.success("Payout recorded and balance updated.");
      setWithdrawId(null);
      setWithdrawAmount("");
      await utils.admin.listPartners.invalidate();
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => setBusyId(null),
  });

  // ── Filtering ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading partners…
      </div>
    );
  }

  const pending   = allPartners.filter((p) => p.status === "PENDING_APPROVAL");
  const active    = allPartners.filter((p) => p.status === "ACTIVE");
  const suspended = allPartners.filter(
    (p) => p.status === "SUSPENDED" || p.status === "REJECTED"
  );

  const filtered =
    tab === "all"       ? allPartners
    : tab === "pending"   ? pending
    : tab === "active"    ? active
    : suspended;

  const tabs = [
    { key: "all"       as Tab, label: "All",                  count: allPartners.length },
    { key: "pending"   as Tab, label: "Pending",              count: pending.length,   urgent: pending.length > 0 },
    { key: "active"    as Tab, label: "Active",               count: active.length },
    { key: "suspended" as Tab, label: "Suspended / Rejected", count: suspended.length },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Tab strip */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  t.urgent ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <Handshake className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">
            {tab === "pending"
              ? "No applications waiting for review."
              : "No partners in this category."}
          </p>
          {tab === "all" && (
            <p className="mt-1 text-xs text-gray-400">
              Share <span className="font-mono">/partner/apply</span> with photographers,
              planners, and boutiques.
            </p>
          )}
        </div>
      )}

      {/* Partner cards */}
      <div className="space-y-3">
        {filtered.map((partner) => (
          <div
            key={partner.id}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            {/* ── Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Name + badges */}
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {partner.businessName}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      STATUS_STYLE[partner.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {partner.status.replace(/_/g, " ")}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                    {partner.planKey} · {(partner.commissionBps / 100).toFixed(0)}%
                    {" "}commission
                  </span>
                </div>

                {/* Contact */}
                <p className="text-sm text-gray-500">
                  {partner.contactName} · {partner.email}
                  {partner.phone ? ` · ${partner.phone}` : ""}
                  {partner.website && (
                    <>
                      {" · "}
                      <a
                        href={
                          partner.website.startsWith("http")
                            ? partner.website
                            : `https://${partner.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {partner.website}
                      </a>
                    </>
                  )}
                </p>

                {/* Stats row */}
                <p className="mt-1 text-xs text-gray-400">
                  /?ref={partner.slug} ·{" "}
                  {partner._count.orders} order{partner._count.orders !== 1 ? "s" : ""} ·{" "}
                  {partner._count.customers} customer{partner._count.customers !== 1 ? "s" : ""} ·{" "}
                  balance {formatCents(partner.creditBalanceCents)}
                </p>

                {/* Referral source quote */}
                {partner.referralSource && (
                  <p className="mt-1.5 text-xs italic text-gray-500">
                    &ldquo;{partner.referralSource}&rdquo;
                  </p>
                )}

                {/* Approval date */}
                {partner.approvedAt && (
                  <p className="mt-1 text-xs text-gray-400">
                    Approved{" "}
                    {new Date(partner.approvedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}

                {/* Applied date */}
                <p className="mt-0.5 text-xs text-gray-400">
                  Applied{" "}
                  {new Date(partner.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* ── Action buttons ── */}
              <div className="flex flex-wrap gap-2">
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
                    {busyId === partner.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Approve
                  </Button>
                )}

                {partner.status !== "SUSPENDED" && partner.status !== "REJECTED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    disabled={busyId === partner.id}
                    onClick={() => {
                      setBusyId(partner.id);
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

                {/* Re-activate suspended/rejected partners */}
                {(partner.status === "SUSPENDED" || partner.status === "REJECTED") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={busyId === partner.id}
                    onClick={() => {
                      setBusyId(partner.id);
                      approve.mutate({ partnerId: partner.id });
                    }}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Re-activate
                  </Button>
                )}

                {partner.status === "ACTIVE" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => {
                      setEditPlanId(editPlanId === partner.id ? null : partner.id);
                      setSelectedPlan(partner.planKey as Plan);
                      setCustomBps(null);
                      setWithdrawId(null);
                    }}
                  >
                    Change plan
                  </Button>
                )}

                {partner.status === "ACTIVE" && partner.creditBalanceCents > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => {
                      setWithdrawId(withdrawId === partner.id ? null : partner.id);
                      setWithdrawAmount("");
                      setEditPlanId(null);
                    }}
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    Record payout
                  </Button>
                )}
              </div>
            </div>

            {/* ── Plan change form ── */}
            {editPlanId === partner.id && (
              <div className="mt-4 flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Plan
                  </label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => {
                      setSelectedPlan(e.target.value as Plan);
                      setCustomBps(null);
                    }}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p}>
                        {p} ({(DEFAULT_BPS[p] / 100).toFixed(0)}% default)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Commission % override (optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    placeholder={`${(DEFAULT_BPS[selectedPlan] / 100).toFixed(0)}% default`}
                    value={customBps !== null ? (customBps / 100).toString() : ""}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setCustomBps(isNaN(v) ? null : Math.round(v * 100));
                    }}
                    className="w-40 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={busyId === partner.id}
                    onClick={() => {
                      setBusyId(partner.id);
                      updatePlan.mutate({
                        partnerId: partner.id,
                        planKey: selectedPlan,
                        ...(customBps !== null ? { commissionBps: customBps } : {}),
                      });
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditPlanId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* ── Withdrawal form ── */}
            {withdrawId === partner.id && (
              <div className="mt-4 flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div>
                  <p className="mb-2 text-xs text-gray-500">
                    Available balance:{" "}
                    <strong>{formatCents(partner.creditBalanceCents)}</strong>
                  </p>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Payout amount (USD)
                  </label>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    placeholder="e.g. 50.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-36 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={busyId === partner.id || !withdrawAmount}
                    onClick={() => {
                      const dollars = parseFloat(withdrawAmount);
                      if (isNaN(dollars) || dollars <= 0) {
                        toast.error("Enter a valid amount.");
                        return;
                      }
                      const cents = Math.round(dollars * 100);
                      if (cents > partner.creditBalanceCents) {
                        toast.error("Amount exceeds partner balance.");
                        return;
                      }
                      setBusyId(partner.id);
                      recordWithdrawal.mutate({
                        partnerId: partner.id,
                        amountCents: cents,
                      });
                    }}
                  >
                    Record payout
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setWithdrawId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
