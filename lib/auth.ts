import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";
import { db } from "@/lib/db";
import { compareSync } from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login",
  },
  providers: [
    // Magic link for couples
    Email({
      server: {
        host: "smtp.resend.com",
        port: 465,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: process.env.FROM_EMAIL ?? "hello@wedprint.com",
    }),

    // Password login for operator
    Credentials({
      id: "operator-credentials",
      name: "Operator Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const inputEmail    = (credentials.email    as string).trim().toLowerCase();
        const inputPassword = (credentials.password as string);

        // ── 1. Env-var check (works without any DB setup) ────────────────────
        // Set OPERATOR_EMAIL and OPERATOR_PASSWORD in Vercel env vars.
        // This is checked first — no database required.
        const envEmail    = (process.env.OPERATOR_EMAIL    ?? "").trim().toLowerCase();
        const envPassword = (process.env.OPERATOR_PASSWORD ?? process.env.OPERATOR_SEED_PASSWORD ?? "");

        console.log(`[auth] operator login attempt — input email: "${inputEmail}"`);
        console.log(`[auth] OPERATOR_EMAIL env: "${envEmail}"`);
        console.log(`[auth] OPERATOR_PASSWORD set: ${envPassword ? "yes" : "NO — missing!"}`);
        console.log(`[auth] email match: ${inputEmail === envEmail}, password match: ${inputPassword === envPassword}`);

        if (envEmail && envPassword && inputEmail === envEmail && inputPassword === envPassword) {
          console.log("[auth] operator authenticated via env vars ✓");
          return { id: "operator-env", email: envEmail, name: "WedPrint Operator", role: "operator" };
        }

        // ── 2. DB fallback (keeps backward compat with hashed-password setup) ──
        const user = await db.user.findUnique({
          where: { email: inputEmail },
        });

        console.log(`[auth] DB user found: ${user ? "yes" : "no"}, role: ${user?.role ?? "n/a"}, has hash: ${!!user?.passwordHash}`);

        if (!user || user.role !== "operator" || !user.passwordHash) {
          console.log("[auth] operator auth failed — no matching DB record");
          return null;
        }

        const isValid = compareSync(inputPassword, user.passwordHash);
        console.log(`[auth] bcrypt hash match: ${isValid}`);

        if (!isValid) return null;

        console.log("[auth] operator authenticated via DB ✓");
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "couple";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
