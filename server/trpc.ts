/**
 * tRPC server initialization.
 *
 * Defines:
 *  - createTRPCContext — builds the request context (session, db)
 *  - createTRPCRouter  — factory for all routers
 *  - publicProcedure   — unauthenticated endpoint
 *  - protectedProcedure — requires a logged-in session
 *  - operatorProcedure  — requires role: operator | admin | super_admin
 *  - adminProcedure     — requires role: admin | super_admin
 *  - partnerProcedure   — requires an ACTIVE Partner row matching the session email
 */

import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// ── Context ───────────────────────────────────────────────────────────────────

export async function createTRPCContext(_opts: { req?: Request }) {
  const session = await auth();
  return {
    db,
    session,
    /** Convenience accessor — null when unauthenticated. */
    user: session?.user ?? null,
  };
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// ── tRPC init ─────────────────────────────────────────────────────────────────

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Surface Zod validation errors to the client in a structured format.
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// ── Exports ───────────────────────────────────────────────────────────────────

export const createTRPCRouter = t.router;

/** No auth required. */
export const publicProcedure = t.procedure;

// ── Middleware ────────────────────────────────────────────────────────────────

/** Throws UNAUTHORIZED if there is no active session. */
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      // Re-type user as non-null for downstream procedures.
      user: ctx.session.user,
    },
  });
});

/** Throws FORBIDDEN if the user is not operator/admin/super_admin. */
const enforceOperator = enforceAuth.unstable_pipe(({ ctx, next }) => {
  const role = ctx.user.role;
  if (role !== "operator" && role !== "admin" && role !== "super_admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

/** Throws FORBIDDEN if the user is not admin/super_admin. */
const enforceAdmin = enforceAuth.unstable_pipe(({ ctx, next }) => {
  const role = ctx.user.role;
  if (role !== "admin" && role !== "super_admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

/**
 * Resolves the Partner row for the logged-in user and injects it into ctx.
 *
 * Partners authenticate with the existing Auth.js magic-link (Email) provider,
 * so their User.role stays "couple" — identity is matched on email instead of
 * role. Anything other than an ACTIVE partner is rejected.
 */
const enforcePartner = enforceAuth.unstable_pipe(async ({ ctx, next }) => {
  const email = ctx.user.email;
  if (!email) {
    throw new TRPCError({ code: "FORBIDDEN", message: "No email on session." });
  }

  const partner = await ctx.db.partner.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!partner) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No partner account is linked to this email.",
    });
  }

  if (partner.status !== "ACTIVE") {
    throw new TRPCError({
      code: "FORBIDDEN",
      // Surfaced verbatim in the dashboard so pending applicants see why.
      message:
        partner.status === "PENDING_APPROVAL"
          ? "Your partner application is still under review."
          : "This partner account is not active. Contact support.",
    });
  }

  // Backfill the User link the first time an approved partner logs in.
  if (!partner.ownerId && ctx.user.id) {
    await ctx.db.partner.update({
      where: { id: partner.id },
      data: { ownerId: ctx.user.id },
    });
  }

  return next({ ctx: { ...ctx, partner } });
});

// ── Procedure factories ───────────────────────────────────────────────────────

/** Requires an authenticated session (any role). */
export const protectedProcedure = t.procedure.use(enforceAuth);

/** Requires role: operator | admin | super_admin. */
export const operatorProcedure = t.procedure.use(enforceOperator);

/** Requires role: admin | super_admin. */
export const adminProcedure = t.procedure.use(enforceAdmin);

/** Requires an ACTIVE Partner matching the session email. Adds ctx.partner. */
export const partnerProcedure = t.procedure.use(enforcePartner);
