"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * Sticky bottom CTA bar — visible on mobile only, appears after
 * the user scrolls past the hero section (~400px).
 */
export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Gradient fade so it doesn't feel abrupt */}
      <div className="h-4 bg-gradient-to-t from-white to-transparent" />
      <div
        className="bg-white/95 backdrop-blur-sm border-t px-4 py-3 flex items-center justify-between gap-3"
        style={{ borderColor: "var(--wp-border)" }}
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: "var(--wp-charcoal)" }}>
            Custom cake toppers from $79
          </p>
          <p className="text-[10px]" style={{ color: "var(--wp-muted)" }}>
            50% deposit · you approve first
          </p>
        </div>
        <Link href="/order/step1-style" className="flex-shrink-0">
          <Button size="sm" className="btn-cta border-0 hover:opacity-90 gap-1 text-xs px-4">
            Order now
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
