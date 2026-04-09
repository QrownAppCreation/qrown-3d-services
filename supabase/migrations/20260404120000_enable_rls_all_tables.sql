-- WedPrint — Row Level Security (RLS) for all Prisma / public schema tables
-- Apply in Supabase: Dashboard → SQL → New query → paste → Run
-- Or: supabase db push (if using Supabase CLI linked to this project)
--
-- Notes:
-- • The database role used by Prisma (typically `postgres`, superuser) bypasses RLS — API routes keep working.
-- • The Supabase `service_role` JWT also bypasses RLS — server-side Supabase JS with service role is unaffected.
-- • `anon` has no policies → no rows visible via PostgREST / direct client access.
-- • `authenticated` may SELECT rows tied to auth.jwt() email matching Couple.email (future Supabase Auth + PostgREST use).
-- • No INSERT/UPDATE/DELETE policies for anon/authenticated — writes go through the Next.js API + Prisma only.

-- ── Enable RLS on every application table ───────────────────────────────────

ALTER TABLE public."Couple"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Order"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Design"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PrintJob"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."StyleTemplate"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AddOn"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;

-- ── Authenticated: read own couple + order graph (email match to Couple) ───

DROP POLICY IF EXISTS "couples_select_own_email" ON public."Couple";
CREATE POLICY "couples_select_own_email"
  ON public."Couple"
  FOR SELECT
  TO authenticated
  USING (
    email IS NOT NULL
    AND (auth.jwt() ->> 'email') IS NOT NULL
    AND email = (auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "orders_select_own_via_couple" ON public."Order";
CREATE POLICY "orders_select_own_via_couple"
  ON public."Order"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public."Couple" c
      WHERE c.id = "Order"."coupleId"
        AND c.email IS NOT NULL
        AND (auth.jwt() ->> 'email') IS NOT NULL
        AND c.email = (auth.jwt() ->> 'email')
    )
  );

DROP POLICY IF EXISTS "designs_select_own_via_order" ON public."Design";
CREATE POLICY "designs_select_own_via_order"
  ON public."Design"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public."Order" o
      INNER JOIN public."Couple" c ON c.id = o."coupleId"
      WHERE o.id = "Design"."orderId"
        AND c.email IS NOT NULL
        AND (auth.jwt() ->> 'email') IS NOT NULL
        AND c.email = (auth.jwt() ->> 'email')
    )
  );

DROP POLICY IF EXISTS "addons_select_own_via_order" ON public."AddOn";
CREATE POLICY "addons_select_own_via_order"
  ON public."AddOn"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public."Order" o
      INNER JOIN public."Couple" c ON c.id = o."coupleId"
      WHERE o.id = "AddOn"."orderId"
        AND c.email IS NOT NULL
        AND (auth.jwt() ->> 'email') IS NOT NULL
        AND c.email = (auth.jwt() ->> 'email')
    )
  );

DROP POLICY IF EXISTS "printjobs_select_own_via_design" ON public."PrintJob";
CREATE POLICY "printjobs_select_own_via_design"
  ON public."PrintJob"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public."Design" d
      INNER JOIN public."Order" o ON o.id = d."orderId"
      INNER JOIN public."Couple" c ON c.id = o."coupleId"
      WHERE d.id = "PrintJob"."designId"
        AND c.email IS NOT NULL
        AND (auth.jwt() ->> 'email') IS NOT NULL
        AND c.email = (auth.jwt() ->> 'email')
    )
  );

-- Sensitive / catalog / auth tables: no policies for anon or authenticated
-- (RLS enabled + no permissive policies = deny all direct client access.)
-- NextAuth "User" / "Account" / "Session" / "VerificationToken" remain API-only.
