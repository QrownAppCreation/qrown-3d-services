export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, CheckCircle2, LogOut, Handshake } from "lucide-react";
import { signOut } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { PartnerRoster } from "@/components/operator/PartnerRoster";

export default async function OperatorPartnersPage() {
  const session = await auth();
  if (!session || session.user.role !== "operator") {
    redirect("/operator/login");
  }

  return (
    <div className="min-h-screen bg-muted/20">

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 top-0 flex w-56 flex-col"
        style={{ backgroundColor: "var(--wp-charcoal)" }}
      >
        <div className="border-b border-white/10 p-5">
          <Logo width={168} variant="onDark" href="/" />
          <p className="mt-1 text-xs text-white/50">Operator Dashboard</p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <Link
            href="/operator/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Package className="h-4 w-4" />
            Orders
          </Link>
          {/* Partners — active */}
          <Link
            href="/operator/partners"
            className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2.5 text-sm font-medium text-white"
          >
            <Handshake className="h-4 w-4" />
            Partners
          </Link>
          <Link
            href="/operator/launch-checklist"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <CheckCircle2 className="h-4 w-4" />
            Launch checklist
          </Link>
        </nav>

        <form
          className="p-3"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/operator/login" });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <div className="pl-56">
        <header className="border-b border-border bg-white px-8 py-5">
          <div className="flex items-center gap-3">
            <Handshake className="h-6 w-6 text-gray-400" />
            <div>
              <h1 className="text-2xl font-bold">Partners</h1>
              <p className="text-sm text-muted-foreground">
                Approve applications, manage plans, and record payouts
              </p>
            </div>
          </div>
        </header>

        <main className="p-8">
          <PartnerRoster />
        </main>
      </div>
    </div>
  );
}
