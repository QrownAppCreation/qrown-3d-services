"use client";

/**
 * Referral attribution (client side).
 *
 * A partner shares wedprint3d.com/?ref=their-slug. We persist that slug so it
 * survives the whole multi-step order wizard and any page refresh, then send
 * it to /api/orders/create at checkout.
 *
 * Stored in BOTH localStorage and a cookie:
 *  - localStorage survives tab closes and is what the wizard reads.
 *  - the cookie makes the slug visible to server components later (Phase 5
 *    white-label routing) without another client round trip.
 *
 * Note the wizard draft lives in sessionStorage; the ref deliberately does
 * not, because couples routinely browse, close the tab, and come back.
 */

const REF_KEY = "wedprint_partner_ref";
/** Attribution window, in days. Matches the industry-standard 30-day cookie. */
const REF_TTL_DAYS = 30;

interface StoredRef {
  slug: string;
  /** Epoch ms when this attribution expires. */
  expiresAt: number;
}

/** Same normalization as the server's slugify — keeps lookups consistent. */
function normalize(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * Reads ?ref= from the current URL and persists it.
 * Call once on mount from a client component. First touch wins — an existing
 * unexpired ref is not overwritten, so a partner can't poach another's lead
 * by getting the second click.
 */
export function captureRefFromUrl(): void {
  if (typeof window === "undefined") return;

  const raw = new URLSearchParams(window.location.search).get("ref");
  if (!raw) return;

  const slug = normalize(raw);
  if (!slug) return;

  if (getPartnerRef()) return; // first touch wins

  const record: StoredRef = {
    slug,
    expiresAt: Date.now() + REF_TTL_DAYS * 24 * 60 * 60 * 1000,
  };

  try {
    window.localStorage.setItem(REF_KEY, JSON.stringify(record));
  } catch {
    // Private browsing / storage disabled — the cookie below still works.
  }

  // SameSite=Lax so the slug survives the Stripe Checkout round trip back.
  document.cookie = `${REF_KEY}=${encodeURIComponent(slug)}; path=/; max-age=${
    REF_TTL_DAYS * 24 * 60 * 60
  }; SameSite=Lax`;
}

/** Returns the stored referral slug, or null if absent/expired. */
export function getPartnerRef(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(REF_KEY);
    if (stored) {
      const record = JSON.parse(stored) as StoredRef;
      if (record.expiresAt > Date.now()) return record.slug;
      window.localStorage.removeItem(REF_KEY); // expired — clean up
    }
  } catch {
    // Fall through to the cookie.
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${REF_KEY}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/** Clears attribution — called after an order is successfully placed. */
export function clearPartnerRef(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(REF_KEY);
  } catch {
    // Nothing to do.
  }
  document.cookie = `${REF_KEY}=; path=/; max-age=0; SameSite=Lax`;
}
