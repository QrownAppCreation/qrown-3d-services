/**
 * tRPC HTTP endpoint.
 *
 * All tRPC calls — queries and mutations — are handled here via the fetch
 * adapter. The router batches multiple procedure calls into a single HTTP
 * request automatically.
 *
 * URL: /api/trpc/:procedurePath
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `[tRPC error] ${path ?? "unknown"}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
