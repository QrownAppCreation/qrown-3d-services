"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

/** Page heading used across all four portal pages. */
export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <h1
        className="text-3xl"
        style={{ fontFamily: "var(--font-syne)", color: "var(--wp-charcoal)" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1.5 text-sm" style={{ color: "var(--wp-muted)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** Small metric tile. `accent` tints the value (used for money figures). */
export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "sage" | "gold" | "cta";
}) {
  const accentColor =
    accent === "sage"
      ? "var(--wp-sage)"
      : accent === "gold"
        ? "var(--wp-gold)"
        : accent === "cta"
          ? "var(--wp-cta)"
          : "var(--wp-charcoal)";

  return (
    <div
      className="rounded-2xl border bg-white p-5"
      style={{ borderColor: "var(--wp-border)" }}
    >
      <p
        className="mb-2 text-[11px] uppercase tracking-[0.14em]"
        style={{ color: "var(--wp-muted)" }}
      >
        {label}
      </p>
      <p className="text-2xl font-semibold" style={{ color: accentColor }}>
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs" style={{ color: "var(--wp-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/** Centered spinner for tRPC loading states. */
export function PartnerLoading() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2
        className="h-6 w-6 animate-spin"
        style={{ color: "var(--wp-sage)" }}
      />
    </div>
  );
}

/**
 * Renders the FORBIDDEN messages thrown by partnerProcedure as a friendly
 * screen — covers "not logged in", "application under review", and "suspended"
 * without needing three separate checks in every page.
 */
export function PartnerAccessNotice({ message }: { message: string }) {
  const needsLogin = /unauthorized|no email on session/i.test(message);

  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-wp-sage-light">
        <AlertCircle className="h-6 w-6" style={{ color: "var(--wp-sage)" }} />
      </div>
      <h2
        className="mb-3 text-2xl"
        style={{ fontFamily: "var(--font-syne)", color: "var(--wp-charcoal)" }}
      >
        {needsLogin ? "Please sign in" : "Not available yet"}
      </h2>
      <p className="mb-7 text-sm leading-relaxed" style={{ color: "var(--wp-muted)" }}>
        {needsLogin
          ? "Sign in with the email address on your partner account and we'll send you a one-time link."
          : message}
      </p>
      <div className="flex justify-center gap-3">
        {needsLogin ? (
          <Link href="/login">
            <Button size="lg">Sign in</Button>
          </Link>
        ) : (
          <Link href="/">
            <Button variant="outline" size="lg">
              Back to WedPrint
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

/** Empty-state block for tables with no rows yet. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border border-dashed bg-white px-6 py-16 text-center"
      style={{ borderColor: "var(--wp-border)" }}
    >
      <p className="mb-2 font-semibold" style={{ color: "var(--wp-charcoal)" }}>
        {title}
      </p>
      <p className="mx-auto mb-5 max-w-sm text-sm" style={{ color: "var(--wp-muted)" }}>
        {body}
      </p>
      {action}
    </div>
  );
}

/** Order status pill — same palette as the operator dashboard. */
export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING_PAYMENT: "bg-gray-100 text-gray-600",
    PAID: "bg-green-100 text-green-700",
    IN_DESIGN: "bg-blue-100 text-blue-700",
    AWAITING_APPROVAL: "bg-amber-100 text-amber-700",
    APPROVED: "bg-green-100 text-green-700",
    BALANCE_PAID: "bg-indigo-100 text-indigo-700",
    PRINTING: "bg-cyan-100 text-cyan-700",
    COMPLETE: "bg-purple-100 text-purple-700",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        colors[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
