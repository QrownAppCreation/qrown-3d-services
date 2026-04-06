"use client";

// Simple in-memory store for the order wizard
// Data persists across the 6 steps in sessionStorage

export type {
  StyleTier,
  ColorTier,
  AddOnKey,
  OrderDraft,
} from "./order-pricing";

export {
  COLOR_TIER_PRICES,
  SIZE_MODIFIERS,
  BASE_PRICES,
  ADDON_PRICES,
  ADDON_LABELS,
  calculateTotal,
  formatCents,
} from "./order-pricing";

import type { OrderDraft } from "./order-pricing";

const STORAGE_KEY = "wedprint_order_draft";

export function getOrderDraft(): OrderDraft {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as OrderDraft) : {};
  } catch {
    return {};
  }
}

export function saveOrderDraft(updates: Partial<OrderDraft>): OrderDraft {
  const current = getOrderDraft();
  const updated = { ...current, ...updates };
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function clearOrderDraft(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
