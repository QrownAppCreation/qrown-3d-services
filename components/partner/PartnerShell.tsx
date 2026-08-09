"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, Wallet, ExternalLink } from "lucide-react";

const NAV = [
  { href: "/partner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partner/orders", label: "Orders", icon: Package },
  { href: "/partner/customers", label: "Customers", icon: Users },
  { href: "/partner/earnings", label: "Earnings", icon: Wallet },
];

/**
 * Sidebar chrome for the partner portal.
 *
 * Client component because the active-link highlight needs usePathname().
 * Renders children bare on /partner/apply, which is a public marketing page.
 */
export function PartnerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Public marketing pages get no portal chrome.
  const PUBLIC_PATHS = ["/partner/apply", "/partner/pricing"];
  if (PUBLIC_PATHS.some((p) => pathname?.startsWith(p))) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-wp-ivory md:flex">
      {/* Sidebar — collapses to a horizontal scroller on mobile */}
      <aside
        className="border-b bg-white md:min-h-screen md:w-60 md:flex-shrink-0 md:border-b-0 md:border-r"
        style={{ borderColor: "var(--wp-border)" }}
      >
        <div
          className="hidden border-b px-6 py-5 md:block"
          style={{ borderColor: "var(--wp-border)" }}
        >
          <Link
            href="/"
            className="text-lg tracking-[0.15em]"
            style={{ fontFamily: "var(--font-syne)", color: "var(--wp-charcoal)" }}
          >
            WEDPRINT
          </Link>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--wp-gold)" }}>
            Partner Portal
          </p>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:px-3 md:py-4">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                style={{
                  // Active row uses the sage tint; inactive stays muted.
                  backgroundColor: active ? "var(--wp-sage-light)" : "transparent",
                  color: active ? "var(--wp-charcoal)" : "var(--wp-muted)",
                }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div
          className="hidden border-t px-5 py-4 md:block"
          style={{ borderColor: "var(--wp-border)" }}
        >
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs"
            style={{ color: "var(--wp-muted)" }}
          >
            View main site
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </aside>

      <main className="flex-1 px-5 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
