/**
 * Root tRPC router — combines all sub-routers into one app router.
 *
 * Every tRPC call goes through a single HTTP endpoint at /api/trpc.
 * Add new routers here as the platform grows.
 */

import { createTRPCRouter } from "@/server/trpc";
import { ordersRouter } from "./orders";
import { reviewsRouter } from "./reviews";
import { adminRouter } from "./admin";

export const appRouter = createTRPCRouter({
  orders: ordersRouter,
  reviews: reviewsRouter,
  admin: adminRouter,
});

/** Type exported for the client — never import the full router on the client side. */
export type AppRouter = typeof appRouter;
