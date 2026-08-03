/**
 * Admin router — user management and platform-level operations.
 * All procedures require role: admin | super_admin.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "@/server/trpc";

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
    const [totalOrders, totalCouples, pendingReviews, approvedReviews] =
      await Promise.all([
        ctx.db.order.count(),
        ctx.db.couple.count(),
        ctx.db.review.count({ where: { approved: false } }),
        ctx.db.review.count({ where: { approved: true } }),
      ]);

    return { totalOrders, totalCouples, pendingReviews, approvedReviews };
  }),
});
