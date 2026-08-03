/**
 * Reviews router — public submission + operator moderation.
 *
 * Note: photo uploads stay in the existing /api/reviews/submit HTTP route
 * because they use multipart/formData. This router handles the read and
 * moderation side of reviews.
 */

import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  operatorProcedure,
} from "@/server/trpc";

export const reviewsRouter = createTRPCRouter({
  /**
   * List all approved reviews (public).
   * Used by operator dashboard to see what's live.
   */
  list: publicProcedure
    .input(
      z.object({ limit: z.number().min(1).max(50).default(20) }).optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.review.findMany({
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: input?.limit ?? 20,
      });
    }),

  /**
   * List all reviews pending operator approval.
   * Requires: operator | admin
   */
  getPending: operatorProcedure.query(async ({ ctx }) => {
    return ctx.db.review.findMany({
      where: { approved: false },
      orderBy: { createdAt: "desc" },
    });
  }),

  /**
   * Approve or delete a review.
   * Requires: operator | admin
   */
  moderate: operatorProcedure
    .input(
      z.object({
        id: z.string().min(1),
        action: z.enum(["approve", "reject"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.action === "approve") {
        return ctx.db.review.update({
          where: { id: input.id },
          data: { approved: true },
        });
      }
      // reject = hard delete (no approval means it stays hidden, delete saves space)
      return ctx.db.review.delete({ where: { id: input.id } });
    }),
});
