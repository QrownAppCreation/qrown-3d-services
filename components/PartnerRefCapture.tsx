"use client";

import { useEffect } from "react";
import { captureRefFromUrl } from "@/lib/partner-ref";

/**
 * Invisible attribution listener, mounted once in the root layout.
 *
 * Reads window.location.search directly rather than useSearchParams() so it
 * does not force a Suspense boundary or opt any page out of static rendering.
 * Renders nothing.
 */
export function PartnerRefCapture() {
  useEffect(() => {
    captureRefFromUrl();
  }, []);

  return null;
}
