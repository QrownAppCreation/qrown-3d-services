/**
 * Partner domain helpers — server-safe (no "use client").
 *
 * Covers slug generation, commission math, and the commission accrual
 * transaction. Import from tRPC routers and API routes only.
 */

import { db } from "@/lib/db";

/** Default commission for the free Starter tier, in basis points (8.00%). */
export const STARTER_COMMISSION_BPS = 800;

/** Commission rates per plan, in basis points. Mirrors ARCHITECTURE.md §8. */
export const PLAN_COMMISSION_BPS = {
  STARTER: 800,
  PROFESSIONAL: 1200,
  STUDIO: 1800,
  ENTERPRISE: 1800,
} as const;

/** Monthly order caps per plan. `null` = unlimited. */
export const PLAN_ORDER_LIMIT: Record<string, number | null> = {
  STARTER: 5,
  PROFESSIONAL: 50,
  STUDIO: null,
  ENTERPRISE: null,
};

/** "Kate & Co. Photography" → "kate-co-photography" */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD") // splits "é" into "e" + combining accent
    .replace(/[^a-z0-9]+/g, "-") // drops the accents along with all punctuation
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .slice(0, 40);
}

/**
 * Returns a slug guaranteed unique against the Partner table by appending
 * -2, -3, … until free. Falls back to "partner" for empty/emoji-only names.
 */
export async function generateUniqueSlug(businessName: string): Promise<string> {
  const base = slugify(businessName) || "partner";
  let candidate = base;
  let suffix = 1;

  // Bounded loop — realistically resolves on the first or second pass.
  while (suffix < 100) {
    const existing = await db.partner.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  // Extremely unlikely — guarantee uniqueness with a timestamp tail.
  return `${base}-${Date.now().toString(36)}`;
}

/** Commission in cents from an order total. bps = basis points (800 = 8%). */
export function commissionCents(orderTotalCents: number, bps: number): number {
  return Math.round((orderTotalCents * bps) / 10_000);
}

/** Full order value = deposit + balance (matches how orders are stored). */
export function orderTotalCents(order: {
  depositCents: number;
  balanceCents: number;
}): number {
  return order.depositCents + order.balanceCents;
}

/**
 * Credits a partner's commission for a completed order.
 *
 * Safe to call repeatedly — the @@unique([orderId, type]) constraint on
 * CreditTransaction makes a second COMMISSION row for the same order fail,
 * which we swallow and report as `alreadyAccrued`.
 *
 * Returns null when the order has no partner (a direct order).
 */
export async function accrueCommissionForOrder(orderId: string): Promise<{
  accrued: boolean;
  alreadyAccrued: boolean;
  amountCents: number;
} | null> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      partnerId: true,
      depositCents: true,
      balanceCents: true,
      status: true,
    },
  });

  if (!order?.partnerId) return null;

  const partner = await db.partner.findUnique({
    where: { id: order.partnerId },
    select: { id: true, commissionBps: true, status: true },
  });

  // Suspended/rejected partners stop earning on new completions.
  if (!partner || partner.status !== "ACTIVE") return null;

  const amountCents = commissionCents(orderTotalCents(order), partner.commissionBps);
  if (amountCents <= 0) {
    return { accrued: false, alreadyAccrued: false, amountCents: 0 };
  }

  try {
    // Ledger row + denormalized balance move together or not at all.
    await db.$transaction(async (tx) => {
      await tx.creditTransaction.create({
        data: {
          partnerId: partner.id,
          orderId: order.id,
          amountCents,
          type: "COMMISSION",
          note: `Commission on order #${order.id.slice(-8).toUpperCase()}`,
        },
      });

      await tx.partner.update({
        where: { id: partner.id },
        data: { creditBalanceCents: { increment: amountCents } },
      });
    });

    return { accrued: true, alreadyAccrued: false, amountCents };
  } catch (err) {
    // P2002 = unique constraint violation → commission was already recorded.
    const code = (err as { code?: string }).code;
    if (code === "P2002") {
      return { accrued: false, alreadyAccrued: true, amountCents };
    }
    throw err;
  }
}

/**
 * Resolves a referral slug to an ACTIVE partner id.
 * Returns null for unknown, inactive, or missing slugs — never throws, so a
 * bad ?ref= value can never block an order from being placed.
 */
export async function resolvePartnerIdFromRef(
  ref: string | null | undefined
): Promise<string | null> {
  if (!ref) return null;
  const slug = slugify(ref);
  if (!slug) return null;

  const partner = await db.partner.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });

  return partner && partner.status === "ACTIVE" ? partner.id : null;
}
