import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Star,
  Sparkles,
  Clock,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-wedprint-rose fill-wedprint-rose" />
            <span className="font-bold text-xl tracking-tight">WedPrint</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/order/step1-style">
              <Button size="sm">Start your order</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="wedding-gradient py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <Badge className="mb-6 bg-white/60 text-foreground border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            Handcrafted 3D Printed Keepsakes
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance mb-6">
            Your love story,
            <br />
            <span className="text-wedprint-rose">perfectly printed.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 text-balance max-w-xl mx-auto">
            Upload your photos. Choose your style. We&apos;ll hand-craft a
            custom 3D printed cake topper or keepsake that captures you
            perfectly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order/step1-style">
              <Button size="lg" className="gap-2 text-base px-8">
                Start your order
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-base px-8">
              See examples
            </Button>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">
            What we create
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Every piece is custom-designed from your photos, then 3D printed to
            order.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.map((product) => (
              <div
                key={product.name}
                className="border rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{product.icon}</div>
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {product.description}
                </p>
                <p className="font-medium text-sm">{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 px-4 bg-white border-t">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <Clock className="h-8 w-8 text-wedprint-rose" />
              <h3 className="font-semibold">5–7 day turnaround</h3>
              <p className="text-muted-foreground text-sm">
                Rush orders available in 72 hours
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star className="h-8 w-8 text-wedprint-gold" />
              <h3 className="font-semibold">You approve before we print</h3>
              <p className="text-muted-foreground text-sm">
                Review your 3D design before a single gram of filament is used
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-wedprint-sage" />
              <h3 className="font-semibold">Satisfaction guaranteed</h3>
              <p className="text-muted-foreground text-sm">
                We&apos;ll revise until you love it
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 wedding-gradient text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Ready to create something beautiful?
          </h2>
          <p className="text-muted-foreground mb-8">
            It only takes 5 minutes to place your order.
          </p>
          <Link href="/order/step1-style">
            <Button size="lg" className="gap-2 text-base px-10">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 fill-current" />
            <span className="font-bold">WedPrint</span>
          </div>
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} WedPrint. Made with love.
          </p>
          <Link
            href="/operator/login"
            className="text-primary-foreground/40 text-xs hover:text-primary-foreground/70 transition-colors"
          >
            Operator login
          </Link>
        </div>
      </footer>
    </div>
  );
}

const PRODUCTS = [
  {
    icon: "🎂",
    name: "Cake Toppers",
    description:
      "Custom miniature figures of you and your partner, crafted from your photos.",
    price: "From $79",
  },
  {
    icon: "💝",
    name: "Bridal Party Gifts",
    description:
      "Personalised keepsakes for your bridesmaids, groomsmen, and flower girls.",
    price: "From $49 each",
  },
  {
    icon: "🎁",
    name: "Guest Favours",
    description:
      "Miniature custom prints your guests will treasure long after the big day.",
    price: "From $85 per 10",
  },
  {
    icon: "🧲",
    name: "Fridge Magnets",
    description:
      "Beautiful relief portraits of you two — a daily reminder of your special day.",
    price: "From $18 each",
  },
];

const STEPS = [
  {
    title: "Choose your style",
    description:
      "Pick an aesthetic — fun and playful, elegant and formal, romantic, or adventurous.",
  },
  {
    title: "Upload your photos",
    description:
      "Share clear photos of yourselves plus any outfit or inspiration references.",
  },
  {
    title: "Approve and print",
    description:
      "We design your piece, you approve the 3D preview, then we print and ship.",
  },
];
