import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth(function middleware(req) {
  const { nextUrl, auth: session } = req as NextRequest & {
    auth: { user?: { role?: string } } | null;
  };
  const isLoggedIn = !!session;
  const isOperatorRoute = nextUrl.pathname.startsWith("/operator");
  const isOperatorLogin = nextUrl.pathname === "/operator/login";

  // Protect all /operator/* routes except /operator/login
  if (isOperatorRoute && !isOperatorLogin) {
    if (!isLoggedIn || session?.user?.role !== "operator") {
      return NextResponse.redirect(new URL("/operator/login", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/operator/:path*"],
};
