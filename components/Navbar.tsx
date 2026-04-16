import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

/** Main marketing site navigation (light background). */
export function Navbar() {
  return (
    <nav className="border-b border-border bg-background/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Logo width={200} href="/" />
        <div className="flex items-center gap-3">
          <Link href="/gallery">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Gallery
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Button>
          </Link>
          <Link href="/share-your-moment">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Share your moment
            </Button>
          </Link>
          <Link href="/reviews">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Reviews
            </Button>
          </Link>
          <Link href="/track-order">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Track my order
            </Button>
          </Link>
          <Link href="/order/step1-style">
            <Button size="sm" className="btn-cta border-0 hover:opacity-90">
              Start your order
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
