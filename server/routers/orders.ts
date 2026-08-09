/**
 * Orders router — couple tracking + operator management.
 *
 * Note: order creation (POST /api/orders/create) stays as an HTTP route
 * because it involves Stripe Checkout session creation and multipart email
 * payloads. This router exposes read + status-update operations.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  operatorProcedure,
} from "@/server/trpc";
// PHASE 2 — partner commission ledger.
import { accrueCommissionForOrder } from "@/lib/partner";

/** All valid order status values (mirrors Prisma enum). */
const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "IN_DESIGN",
  "AWAITING_APPROVAL",
  "APPROVED",
  "BALANCE_PAID",
  "PRINTING",
  "COMPLETE",
  "CANCELLED",
] as const;

export const ordersRouter = createTRPCRouter({
  /**
   * Fetch an order via the couple's magic link token.
   * Public — no login required (the token IS the auth).
   */
  getByToken: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const couple = await ctx.db.couple.findFirst({
        where: {
          magicLinkToken: input.token,
          tokenExpiry: { gt: new Date() },
        },
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              designs: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
              addOns: true,
            },
          },
        },
      });

      if (!couple) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found or link has expired.",
        });
      }

      return couple;
    }),

  /**
   * List all orders with optional status filter + pagination.
   * Requires: operator | admin
   */
  getAll: operatorProcedure
    .input(
      z
        .object({
          status: z.enum(ORDER_STATUSES).optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(50).default(20),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const where = input?.status ? { status: input.status } : {};

      const [orders, total] = await Promise.all([
        ctx.db.order.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            couple: true,
            addOns: true,
            designs: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        }),
        ctx.db.order.count({ where }),
      ]);

      return {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  /**
   * Get a single order by ID.
   * Requires: operator | admin
   */
  getById: operatorProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.id },
        include: {
          couple: true,
          designs: {
            orderBy: { createdAt: "desc" },
            include: { printJobs: true },
          },
          addOns: true,
        },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      }

      return order;
    }),

  /**
   * Update order status (and optionally add operator notes).
   * Requires: operator | admin
   */
  updateStatus: operatorProcedure
    .input(
      z.object({
        orderId: z.string().min(1),
        status: z.enum(ORDER_STATUSES),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.update({
        where: { id: input.orderId },
        data: {
          status: input.status,
          ...(input.notes !== undefined
            ? { styleNotes: input.notes }
            : {}),
        },
      });

      // PHASE 2 — credit partner commission once the order is complete.
      // accrueCommissionForOrder is idempotent, so flipping a status back and
      // forth to COMPLETE can never double-credit.
      if (input.status === "COMPLETE") {
        await accrueCommissionForOrder(order.id);
      }

      return order;
    }),

  /**
   * Summary stats for the operator dashboard.
   * Requires: operator | admin
   */
  getStats: operatorProcedure.query(async ({ ctx }) => {
    const [
      total,
      pending,
      inDesign,
      awaitingApproval,
      printing,
      complete,
    ] = await Promise.all([
      ctx.db.order.count(),
      ctx.db.order.count({ where: { status: "PENDING_PAYMENT" } }),
      ctx.db.order.count({ where: { status: "IN_DESIGN" } }),
      ctx.db.order.count({ where: { status: "AWAITING_APPROVAL" } }),
      ctx.db.order.count({ where: { status: "PRINTING" } }),
      ctx.db.order.count({ where: { status: "COMPLETE" } }),
    ]);

    return { total, pending, inDesign, awaitingApproval, printing, complete };
  }),
});
