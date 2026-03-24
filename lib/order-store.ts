"use client";

// Simple in-memory store for the order wizard
// Data persists across the 5 steps in sessionStorage

export type StyleTier =
  | "FUN"
  | "ELEGANT"
  | "ROMANTIC"
  | "ADVENTUROUS"
  | "CUSTOM";

export type AddOnKey =
  | "HAND_PAINTING"
  | "GIFT_BOX"
  | "ENGRAVED_BASE"
  | "RUSH_ORDER"
  | "STL_LICENSE";

export interface OrderDraft {
  styleTier?: StyleTier;
  quantity?: number;
  sizeCm?: string;
  partner1Name?: string;
  partner2Name?: string;
  weddingDate?: string;
  colorPalette?: string;
  styleNotes?: string;
  photoUrls?: {
    partner1?: string;
    partner2?: string;
    outfit?: string;
    pet?: string;
    inspiration?: string;
  };
  addOns?: Partial<Record<AddOnKey, boolean>>;
  depositCents?: number;
  totalCents?: number;
}

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

// Price calculations
export const BASE_PRICES: Record<string, number> = {
  CAKE_TOPPER: 7900, // $79 in cents
};

export const ADDON_PRICES: Record<AddOnKey, number> = {
  HAND_PAINTING: 4500,
  GIFT_BOX: 800,
  ENGRAVED_BASE: 1200,
  RUSH_ORDER: 0, // calculated as 50% of subtotal
  STL_LICENSE: 3500,
};

export const ADDON_LABELS: Record<AddOnKey, string> = {
  HAND_PAINTING: "Hand-painted finish",
  GIFT_BOX: "Gift box & ribbon",
  ENGRAVED_BASE: "Custom engraved base",
  RUSH_ORDER: "Rush order (72 hrs)",
  STL_LICENSE: "Digital STL file licence",
};

export function calculateTotal(draft: OrderDraft): {
  subtotal: number;
  rushSurcharge: number;
  total: number;
  deposit: number;
  balance: number;
} {
  const qty = draft.quantity ?? 1;
  const basePrice = BASE_PRICES.CAKE_TOPPER * qty;

  let addOnsTotal = 0;
  if (draft.addOns) {
    for (const [key, selected] of Object.entries(draft.addOns)) {
      if (selected && key !== "RUSH_ORDER") {
        addOnsTotal += ADDON_PRICES[key as AddOnKey] * qty;
      }
    }
  }

  const subtotal = basePrice + addOnsTotal;
  const rushSurcharge = draft.addOns?.RUSH_ORDER ? Math.round(subtotal * 0.5) : 0;
  const total = subtotal + rushSurcharge;
  const deposit = Math.round(total * 0.5);
  const balance = total - deposit;

  return { subtotal, rushSurcharge, total, deposit, balance };
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}
