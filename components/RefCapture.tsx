"use client";

/**
 * RefCapture — invisible client component that runs once on mount to persist
 * the partner referral slug from ?ref= into localStorage and a cookie.
 *
 * Include this in any server-component page that may receive referral traffic
 * (homepage, pricing page, etc.). It renders nothing and costs one tiny effect.
 */

import { useEffect } from "react";
import { captureRefFromUrl } from "@/lib/partner-ref";

export function RefCapture() {
  useEffect(() => {
    captureRefFromUrl();
  }, []);

  return null;
}
