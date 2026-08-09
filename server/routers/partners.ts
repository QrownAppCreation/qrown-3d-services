/**
 * Partners router — public application + the partner-facing dashboard.
 *
 * Operator/admin partner management lives in `admin.ts` so all privileged
 * procedures stay behind one RBAC boundary.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  partnerProcedure,
} from "@/server/trpc";
import {
  generateUniqueSlug,
  commissionCents,
  orderTotalCents,
  PLAN_ORDER_LIMIT,
} from "@/lib/partner";
import {
  sendPartnerApplicationReceived,
  sendPartnerApplicationAlert,
} from "@/lib/partner-email";

/** Application form payload — mirrored by the /partner/apply form. */
const applyInput = z.object({
  businessName: z.string().min(2).max(120),
  contactName: z.string().min(2).max(120),
  email: z.email(),
  phone: z.string().max(40).optional(),
  website: z.string().max(200).optional(),
  referralSource: z.string().max(500).optional(),
});

export const partnersRouter = createTRPCRouter({
  /**
   * Public partner application. Creates a PENDING_APPROVAL Partner row.
   * Rate-limiting is handled at the edge (Vercel) — not here.
   */
  submitApplication: publicProcedure
    .input(applyInput)
    .mutation(async ({ ctx, input }) => {
      const email = input.email.trim().toLowerCase();

      const existing = await ctx.db.partner.findUnique({ where: { email } });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            existing.status === "PENDING_APPROVAL"
              ? "You already have an application under review."
              : "A partner account already exists for this email.",
        });
      }

      const slug = await generateUniqueSlug(input.businessName);

      const partner = await ctx.db.partner.create({
        data: {
          businessName: input.businessName.trim(),
          contactName: input.contactName.trim(),
          email,
          slug,
          phone: input.phone?.trim() || null,
          website: input.website?.trim() || null,
          referralSource: input.referralSource?.trim() || null,
          status: "PENDING_APPROVAL",
          planKey: "STARTER",
        },
      });

      // Emails are best-effort — a Resend outage must not fail the application.
      try {
        await sendPartnerApplicationReceived({
          email: partner.email,
          contactName: partner.contactName,
          businessName: partner.businessName,
        });
        await sendPartnerApplicationAlert({
          businessName: partner.businessName,
          contactName: partner.contactName,
          email: partner.email,
          website: partner.website,
          referralSource: partner.referralSource,
        });
      } catch {
        // TODO: pipe partner email failures to an error reporter (Sentry).
      }

      return { id: partner.id, slug: partner.slug, status: partner.status };
    }),

  /**
   * Application status lookup for the "thanks, we're reviewing" screen.
   * Public because the applicant has no session yet — returns status only,
   * never PII beyond what the caller already typed in.
   */
  getApplicationStatus: publicProcedure
    .input(z.object({ email: z.email() }))
    .query(async ({ ctx, input }) => {
      const partner = await ctx.db.partner.findUnique({
        where: { email: input.email.trim().toLowerCase() },
        select: { status: true, businessName: true },
      });
      return partner ?? null;
    }),

  /**
   * Everything the partner dashboard home needs, in one round trip.
   */
  getMyDashboard: partnerProcedure.query(async ({ ctx }) => {
    const partnerId = ctx.partner.id;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [orders, customerCount, ordersThisMonth, recentOrders, pendingSum] =
      await Promise.all([
        ctx.db.order.findMany({
          where: { partnerId },
          select: { status: true, depositCents: true, balanceCents: true },
        }),
        ctx.db.partnerCustomer.count({ where: { partnerId } }),
        ctx.db.order.count({
          where: { partnerId, createdAt: { gte: monthStart } },
        }),
        ctx.db.order.findMany({
          where: { partnerId },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { couple: { select: { name: true, email: true } } },
        }),
        ctx.db.creditTransaction.aggregate({
          where: { partnerId, type: "COMMISSION" },
          _sum: { amountCents: true },
        }),
      ]);

    const grossVolumeCents = orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + orderTotalCents(o), 0);

    // Commission not yet earned: live orders that haven't reached COMPLETE.
    const pipelineCents = orders
      .filter((o) => o.status !== "CANCELLED" && o.status !== "COMPLETE")
      .reduce(
        (sum, o) =>
          sum + commissionCents(orderTotalCents(o), ctx.partner.commissionBps),
        0
      );

    const limit = PLAN_ORDER_LIMIT[ctx.partner.planKey] ?? null;

    return {
      partner: {
        businessName: ctx.partner.businessName,
        slug: ctx.partner.slug,
        planKey: ctx.partner.planKey,
        commissionBps: ctx.partner.commissionBps,
        creditBalanceCents: ctx.partner.creditBalanceCents,
      },
      stats: {
        totalOrders: orders.length,
        activeOrders: orders.filter(
          (o) => o.status !== "COMPLETE" && o.status !== "CANCELLED"
        ).length,
        completedOrders: orders.filter((o) => o.status === "COMPLETE").length,
        customerCount,
        ordersThisMonth,
        monthlyOrderLimit: limit,
        grossVolumeCents,
        lifetimeCommissionCents: pendingSum._sum.amountCents ?? 0,
        pipelineCommissionCents: pipelineCents,
      },
      recentOrders,
    };
  }),

  /** Paginated list of orders attributed to this partner. */
  getMyOrders: partnerProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(50).default(20),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const where = { partnerId: ctx.partner.id };

      const [orders, total] = await Promise.all([
        ctx.db.order.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: { couple: { select: { name: true, email: true } } },
        }),
        ctx.db.order.count({ where }),
      ]);

      // Commission is computed per row so the partner sees it before payout.
      return {
        orders: orders.map((o) => ({
          ...o,
          totalCents: orderTotalCents(o),
          commissionCents: commissionCents(
            orderTotalCents(o),
            ctx.partner.commissionBps
          ),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  /** Couples this partner has referred. */
  getMyCustomers: partnerProcedure.query(async ({ ctx }) => {
    return ctx.db.partnerCustomer.findMany({
      where: { partnerId: ctx.partner.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  /** Commission ledger + current balance. */
  getMyCredits: partnerProcedure.query(async ({ ctx }) => {
    const transactions = await ctx.db.creditTransaction.findMany({
      where: { partnerId: ctx.partner.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        order: { select: { id: true, couple: { select: { name: true } } } },
      },
    });

    const earnedCents = transactions
      .filter((t) => t.type === "COMMISSION")
      .reduce((s, t) => s + t.amountCents, 0);
    const withdrawnCents = transactions
      .filter((t) => t.type === "WITHDRAWAL")
      .reduce((s, t) => s + Math.abs(t.amountCents), 0);

    return {
      balanceCents: ctx.partner.creditBalanceCents,
      earnedCents,
      withdrawnCents,
      transactions,
    };
  }),
});
