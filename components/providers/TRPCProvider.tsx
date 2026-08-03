"use client";

/**
 * TRPCProvider — wraps the app with React Query and the typed tRPC client.
 *
 * Both the QueryClient and the tRPC client are created inside useState so
 * each browser session gets its own instance (avoids cross-request state
 * leaks in SSR environments).
 *
 * Usage: wrap children in the root layout.
 */

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "@/lib/trpc";
import type { AppRouter } from "@/server/routers/_app";
import { createTRPCClient } from "@trpc/client";

function getBaseUrl(): string {
  // Browser — relative URLs work fine
  if (typeof window !== "undefined") return "";
  // Vercel deployment
  if (process.env.NEXT_PUBLIC_VERCEL_URL)
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  // Local dev
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Keep data fresh for 30 seconds before re-fetching
            staleTime: 30_000,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
