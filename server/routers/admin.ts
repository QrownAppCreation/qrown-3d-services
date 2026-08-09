/**
 * Admin router — user management, platform stats, and partner management.
 *
 * User/role procedures require admin | super_admin.
 * Partner procedures use operatorProcedure — the operator runs day-to-day
 * approvals, so gating them behind admin would block the actual workflow.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  adminProcedure,
  operatorProcedure,
} from "@/server/trpc";
import { sendPartnerApprovedEmail } from "@/lib/partner-email";
import { PLAN_COMMISSION_BPS } from "@/lib/partner";

/** Partner lifecycle values (mirrors the Prisma PartnerStatus enum). */
const PARTNER_STATUSES = [
  "PENDING_APPROVAL",
  "ACTIVE",
  "SUSPENDED",
  "REJECTED",
] as const;

const PARTNER_PLANS = [
  "STARTER",
  "PROFESSIONAL",
  "STUDIO",
  "ENTERPRISE",
] as const;

export const adminRouter = createTRPCRouter({
  /**
   * List all users with optional role filter.
   */
  listUsers: adminProcedure
    .input(
      z
        .object({
          role: z.string().optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(25),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 25;
      const where = input?.role ? { role: input.role } : {};

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          orderBy: { email: "asc" },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
          },
        }),
        ctx.db.user.count({ where }),
      ]);

      return { users, total, page, totalPages: Math.ceil(total / limit) };
    }),

  /**
   * Change a user's role.
   */
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        role: z.enum(["couple", "operator", "admin", "super_admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent self-demotion
      if (ctx.user.id === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot change your own role.",
        });
      }

      return ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });
    }),

  /**
   * Platform summary: order volume, review count, user count.
   */
  getPlatformStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalOrders,
      totalCouples,
      pendingReviews,
      approvedReviews,
      pendingPartners,
      activePartners,
    ] = await Promise.all([
      ctx.db.order.count(),
      ctx.db.couple.count(),
      ctx.db.review.count({ where: { approved: false } }),
      ctx.db.review.count({ where: { approved: true } }),
      ctx.db.partner.count({ where: { status: "PENDING_APPROVAL" } }),
      ctx.db.partner.count({ where: { status: "ACTIVE" } }),
    ]);

    return {
      totalOrders,
      totalCouples,
      pendingReviews,
      approvedReviews,
      pendingPartners,
      activePartners,
    };
  }),

  // ── PHASE 2: PARTNER MANAGEMENT ────────────────────────────────────────────

  /**
   * List partners with optional status filter, newest first.
   * Requires: operator | admin
   */
  listPartners: operatorProcedure
    .input(
      z
        .object({
          status: z.enum(PARTNER_STATUSES).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where = input?.status ? { status: input.status } : {};

      const partners = await ctx.db.partner.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        include: {
          // Order counts drive the "is this partner producing" column.
          _count: { select: { orders: true, customers: true } },
        },
      });

      return partners;
    }),

  /**
   * Approve a pending application: flip to ACTIVE, stamp approvedAt,
   * and email the referral link. Idempotent — re-approving is a no-op email.
   * Requires: operator | admin
   */
  approvePartner: operatorProcedure
    .input(
      z.object({
        partnerId: z.string().min(1),
        /// Optional override; defaults to the plan's standard rate.
        commissionBps: z.number().int().min(0).max(5000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.partner.findUnique({
        where: { id: input.partnerId },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Partner not found." });
      }

      const commissionBps =
        input.commissionBps ??
        PLAN_COMMISSION_BPS[existing.planKey] ??
        existing.commissionBps;

      const partner = await ctx.db.partner.update({
        where: { id: input.partnerId },
        data: {
          status: "ACTIVE",
          commissionBps,
          // Preserve the original approval timestamp on re-approval.
          approvedAt: existing.approvedAt ?? new Date(),
        },
      });

      // Only send the welcome email on the first approval.
      if (existing.status !== "ACTIVE") {
        try {
          await sendPartnerApprovedEmail({
            email: partner.email,
            contactName: partner.contactName,
            businessName: partner.businessName,
            slug: partner.slug,
            commissionBps: partner.commissionBps,
          });
        } catch {
          // TODO: report partner approval email failures to an error tracker.
        }
      }

      return partner;
    }),

  /**
   * Suspend or reject a partner. Suspended partners keep their balance but
   * stop accruing new commission (enforced in lib/partner.ts).
   * Requires: operator | admin
   */
  suspendPartner: operatorProcedure
    .input(
      z.object({
        partnerId: z.string().min(1),
        status: z.enum(["SUSPENDED", "REJECTED"]).default("SUSPENDED"),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.partner.update({
        where: { id: input.partnerId },
        data: {
          status: input.status,
          ...(input.reason ? { internalNotes: input.reason } : {}),
        },
      });
    }),

  /**
   * Change a partner's plan and/or commission rate.
   * Requires: operator | admin
   */
  updatePartnerPlan: operatorProcedure
    .input(
      z.object({
        partnerId: z.string().min(1),
        planKey: z.enum(PARTNER_PLANS),
        /// Omit to snap the rate to the plan default.
        commissionBps: z.number().int().min(0).max(5000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.partner.update({
        where: { id: input.partnerId },
        data: {
          planKey: input.planKey,
          commissionBps:
            input.commissionBps ?? PLAN_COMMISSION_BPS[input.planKey],
        },
      });
    }),

  /**
   * Record a manual payout against a partner's balance.
   * Writes a negative WITHDRAWAL row and decrements the denormalized balance.
   * Requires: operator | admin
   */
  recordPartnerWithdrawal: operatorProcedure
    .input(
      z.object({
        partnerId: z.string().min(1),
        amountCents: z.number().int().positive(),
        note: z.string().max(300).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const partner = await ctx.db.partner.findUnique({
        where: { id: input.partnerId },
        select: { creditBalanceCents: true },
      });

      if (!partner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Partner not found." });
      }

      if (input.amountCents > partner.creditBalanceCents) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Withdrawal exceeds the partner's available balance.",
        });
      }

      // Ledger row and balance decrement must land together.
      return ctx.db.$transaction(async (tx) => {
        await tx.creditTransaction.create({
          data: {
            partnerId: input.partnerId,
            amountCents: -input.amountCents,
            type: "WITHDRAWAL",
            note: input.note ?? "Manual payout",
          },
        });

        return tx.partner.update({
          where: { id: input.partnerId },
          data: { creditBalanceCents: { decrement: input.amountCents } },
        });
      });
    }),
});
