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

// ── Procedure factories ───────────────────────────────────────────────────────

/** Requires an authenticated session (any role). */
export const protectedProcedure = t.procedure.use(enforceAuth);

/** Requires role: operator | admin | super_admin. */
export const operatorProcedure = t.procedure.use(enforceOperator);

/** Requires role: admin | super_admin. */
export const adminProcedure = t.procedure.use(enforceAdmin);
