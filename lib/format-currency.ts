/**
 * Canonical USD display for cent amounts — always 2 decimal places (e.g. $59.50).
 * Use this (or `formatCents` from order-pricing) for all money shown in the UI or emails.
 */
export function formatUsdCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
