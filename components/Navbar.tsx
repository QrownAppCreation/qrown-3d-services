"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Gallery",           href: "/gallery" },
  { label: "Pricing",           href: "/pricing" },
  { label: "Reviews",           href: "/reviews" },
  { label: "Track my order",    href: "/track-order" },
];

/** Shown in desktop nav as a subtle gold link, not a ghost button. */
const PARTNER_HREF = "/partner/pricing";

/** Main marketing site navigation — responsive with mobile hamburger menu. */
export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-background/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <Logo width={170} href="/" className="sm:w-[200px]" />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm">
                {l.label}
              </Button>
            </Link>
          ))}
          {/* Partner program — styled in gold to stand out without a full button */}
          <Link
            href={PARTNER_HREF}
            className="text-sm font-semibold px-2 hover:opacity-80 transition-opacity"
            style={{ color: "var(--wp-gold)" }}
          >
            For professionals
          </Link>
          <Link href="/order/step1-style">
            <Button size="sm" className="btn-cta border-0 hover:opacity-90 ml-1">
              Start your order
            </Button>
          </Link>
        </div>

        {/* Mobile: CTA + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/order/step1-style">
            <Button size="sm" className="btn-cta border-0 hover:opacity-90 text-xs px-3 py-1.5">
              Order now
            </Button>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/share-your-moment"
            onClick={() => setOpen(false)}
            className="block py-2.5 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Share your moment
          </Link>
          <Link
            href={PARTNER_HREF}
            onClick={() => setOpen(false)}
            className="block py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors"
            style={{ color: "var(--wp-gold)" }}
          >
            For professionals
          </Link>
        </div>
      )}
    </nav>
  );
}
