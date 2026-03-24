import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in your .env file.");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

// Convenience alias for callers that already import `stripe` directly
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function calculateDeposit(totalCents: number): number {
  return Math.round(totalCents * 0.5);
}

// Pricing table — all prices in cents
export const PRODUCT_PRICES: Record<string, number> = {
  CAKE_TOPPER: 7900,       // $79
  BRIDAL_GIFT: 4900,       // $49
  GUEST_FAVOR_10: 8500,    // $85 per 10
  FRIDGE_MAGNET: 1800,     // $18 each
};

export const ADDON_PRICES: Record<string, number> = {
  HAND_PAINTING: 4500,     // $45 base
  GIFT_BOX: 800,           // $8 base
  ENGRAVED_BASE: 1200,     // $12 per piece
  RUSH_ORDER: 0,           // calculated as 50% surcharge
  STL_LICENSE: 3500,       // $35
  REORDER_FEE: 1500,       // $15
  TRAVEL_FEE: 0,           // varies
  RESIN_COAT: 2000,        // $20
};
