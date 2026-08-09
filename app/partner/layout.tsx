import type { ReactNode } from "react";
import { PartnerShell } from "@/components/partner/PartnerShell";

/**
 * Partner portal layout.
 *
 * /partner/apply is public and renders bare — PartnerShell skips the sidebar
 * for that route so applicants never see a nav they cannot use.
 */
export default function PartnerLayout({ children }: { children: ReactNode }) {
  return <PartnerShell>{children}</PartnerShell>;
}
