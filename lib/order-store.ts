"use client";

// Simple in-memory store for the order wizard
// Data persists across the 6 steps in sessionStorage

export type StyleTier =
  | "FUN"
  | "ELEGANT"
  | "ROMANTIC"
  | "ADVENTUROUS"
  | "CUSTOM";

export type ColorTier = "CLASSIC" | "DUO" | "SIGNATURE" | "HEIRLOOM";

export type AddOnKey =
  | "HAND_PAINTING"
  | "GIFT_BOX"
  | "ENGRAVED_BASE"
  | "RUSH_ORDER"
  | "STL_LICENSE";

export interface OrderDraft {
  styleTier?: StyleTier;
  colorTier?: ColorTier;
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

// ── Color Tier Pricing ────────────────────────────────────────────────────────
// All values in cents.
export const COLOR_TIER_PRICES: Record<ColorTier, {
  label: string;
  colors: number;
  description: string;
  CAKE_TOPPER: number;
  BRIDAL_GIFT: number;
  GUEST_FAVOR: number;
  FRIDGE_MAGNET: number;
}> = {
  CLASSIC: {
    label: "Classic",
    colors: 1,
    description: "Clean, elegant, timeless",
    CAKE_TOPPER:   7900,
    BRIDAL_GIFT:   4900,
    GUEST_FAVOR:   8500,  // per 10 pieces
    FRIDGE_MAGNET: 1800,
  },
  DUO: {
    label: "Duo",
    colors: 2,
    description: "Skin tones and outfit colors distinguished",
    CAKE_TOPPER:   9900,
    BRIDAL_GIFT:   6200,
    GUEST_FAVOR:   11000,
    FRIDGE_MAGNET: 2400,
  },
  SIGNATURE: {
    label: "Signature",
    colors: 3,
    description: "Full detail — hair, skin, and attire",
    CAKE_TOPPER:   12400,
    BRIDAL_GIFT:   7800,
    GUEST_FAVOR:   13800,
    FRIDGE_MAGNET: 3000,
  },
  HEIRLOOM: {
    label: "Heirloom",
    colors: 4,
    description: "Maximum detail — multi-color outfits, accessories, pets",
    CAKE_TOPPER:   15400,
    BRIDAL_GIFT:   9500,
    GUEST_FAVOR:   16500,
    FRIDGE_MAGNET: 3800,
  },
};

// Size modifiers for cake toppers (in cents added on top of tier price)
export const SIZE_MODIFIERS: Record<string, number> = {
  small:    0,
  standard: 1000,
  large:    2000,
};

// ── Legacy / fallback ─────────────────────────────────────────────────────────
export const BASE_PRICES: Record<string, number> = {
  CAKE_TOPPER: 7900, // CLASSIC price — used as fallback
};

export const ADDON_PRICES: Record<AddOnKey, number> = {
  HAND_PAINTING: 4500,
  GIFT_BOX:      800,
  ENGRAVED_BASE: 1200,
  RUSH_ORDER:    0,   // calculated as 50% of subtotal
  STL_LICENSE:   3500,
};

export const ADDON_LABELS: Record<AddOnKey, string> = {
  HAND_PAINTING: "Hand-painted finish",
  GIFT_BOX:      "Gift box & ribbon",
  ENGRAVED_BASE: "Custom engraved base",
  RUSH_ORDER:    "Rush order (72 hrs)",
  STL_LICENSE:   "Digital STL file licence",
};

export function calculateTotal(draft: OrderDraft): {
  subtotal: number;
  rushSurcharge: number;
  total: number;
  deposit: number;
  balance: number;
} {
  const qty      = draft.quantity ?? 1;
  const tier     = draft.colorTier ?? "CLASSIC";
  const tierData = COLOR_TIER_PRICES[tier];
  const sizeMod  = SIZE_MODIFIERS[draft.sizeCm ?? "small"] ?? 0;
  const basePrice = (tierData.CAKE_TOPPER + sizeMod) * qty;

  let addOnsTotal = 0;
  if (draft.addOns) {
    for (const [key, selected] of Object.entries(draft.addOns)) {
      if (selected && key !== "RUSH_ORDER") {
        addOnsTotal += ADDON_PRICES[key as AddOnKey] * qty;
      }
    }
  }

  const subtotal      = basePrice + addOnsTotal;
  const rushSurcharge = draft.addOns?.RUSH_ORDER ? Math.round(subtotal * 0.5) : 0;
  const total         = subtotal + rushSurcharge;
  const deposit       = Math.round(total * 0.5);
  const balance       = total - deposit;

  return { subtotal, rushSurcharge, total, deposit, balance };
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}
