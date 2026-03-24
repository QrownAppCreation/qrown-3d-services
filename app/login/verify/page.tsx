import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="min-h-screen wedding-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Heart className="h-6 w-6 text-wedprint-rose fill-wedprint-rose" />
            <span className="font-bold text-2xl">WedPrint</span>
          </Link>
        </div>

        <Card className="shadow-lg border-0 text-center">
          <CardHeader>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check your inbox</CardTitle>
            <CardDescription>
              We&apos;ve sent you a secure login link. Click it in the email to
              sign in. The link expires in 1 hour.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Didn&apos;t get it? Check your spam folder, or{" "}
              <Link
                href="/login"
                className="underline underline-offset-4 hover:text-foreground"
              >
                try again
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
