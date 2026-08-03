/**
 * tRPC client — typed hooks and vanilla client.
 *
 * Use `trpc.<router>.<procedure>.useQuery(input)` in "use client" components.
 * Import `AppRouter` type only — never import the actual router on the client.
 */

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

/** Typed tRPC hooks for React components (client-side). */
export const trpc = createTRPCReact<AppRouter>();
