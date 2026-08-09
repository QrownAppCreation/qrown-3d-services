# WedPrint3D — Development Handoff Document
## For New Chat Session | Phase 2: Partner Portal MVP
**Last updated:** August 2026 | **Owner:** QB (quincy@qrownengineering.com)

---

## 1. What Is WedPrint3D

WedPrint3D (wedprint3d.com) is a Miami-based business that sells custom 3D-printed wedding cake toppers. Customers upload photos of themselves, choose a style and color tier, pay a 50% deposit, approve a design render, then pay the balance before printing and shipping.

**Business model:** Direct-to-consumer today. Evolving into a SaaS platform where wedding photographers, planners, and bridal boutiques can resell as white-label partners.

**Owner:** QB / Quincy — also owns Qrown Engineering (structural engineering firm) and Qrown Design Build.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| ORM | Prisma 7 + PrismaPg adapter |
| Database | PostgreSQL via Supabase (free tier — pauses after 7 days inactivity) |
| Auth | Auth.js (NextAuth) v5 beta — JWT strategy |
| Payments | Stripe (deposit model — 50% now, 50% at design approval) |
| Storage | Cloudflare R2 (file uploads) |
| Email | Resend |
| API | tRPC v11 + Next.js API routes (coexist) |
| Deployment | Vercel |
| Repo | github.com/QrownAppCreation/wedprint |

**Key config:**
- `.npmrc` has `legacy-peer-deps=true` (nodemailer/auth peer conflict)
- `lib/db.ts` uses PrismaPg with `connectionString` — NOT the default Prisma client
- `export const dynamic = "force-dynamic"` required on any page that fetches from DB
- PowerShell: commands must be run separately (no `&&` separator)
- Git lock issues (`del .git\index.lock`) common — delete lock files if git freezes

---

## 3. Brand & Design

| Token | Value |
|---|---|
| Sage | `#8B9D77` |
| Gold | `#C9A84C` |
| Burnt Orange CTA | `#C4622D` |
| Charcoal | `#2C2C2A` |
| Ivory | `#FAF8F5` |
| Fonts | Syne (headings), Newsreader (body serif), Geist (UI) |
| WhatsApp | `https://wa.me/19546628622` |

CSS variables: `--wp-sage`, `--wp-gold`, `--wp-cta`, `--wp-charcoal`, `--wp-ivory`, `--wp-muted`, `--wp-border`

---

## 4. Existing Database Schema (Current Prisma)

**Key models (what exists today):**

```
Couple        — email, name, magicLinkToken, tokenExpiry, tier
Order         — coupleId, status (enum), depositCents, balanceCents, styleTier, colorTier, weddingDate
Design        — orderId, category, quantity, status, photoUrls (JSON), previewImageUrl, stlUrl, approvalToken
AddOn         — orderId, type (enum), priceCents, quantity
Review        — coupleName, rating, comment, photoUrl, cakePhotoUrl, approved
PrintJob      — designId, printer, status
StyleTemplate — name, category, styleTier
User          — email, role (string: "couple"|"operator"|"admin"), passwordHash
Account/Session/VerificationToken — NextAuth tables
```

**Enums:** `OrderStatus`, `StyleTier` (FUN/ELEGANT/ROMANTIC/ADVENTUROUS/CUSTOM), `ColorTier` (CLASSIC/DUO/SIGNATURE/HEIRLOOM), `DesignStatus`, `AddOnType`

**Note:** `PRESTIGE_SCAN` is in the TypeScript type (`lib/order-pricing.ts`) but NOT yet in the Prisma `StyleTier` enum. It routes to WhatsApp so it never hits the DB — schema update deferred.

---

## 5. Existing File Structure (Key Files)

```
app/
  (root)/page.tsx              ← Landing page ("use client")
  reviews/page.tsx             ← Reviews page (force-dynamic, static reviews only)
  pricing/page.tsx             ← Pricing page (includes Prestige Scan card)
  order/
    step1-style/page.tsx       ← Style tier selector (includes PRESTIGE_SCAN)
    step2-products/page.tsx    ← Product/color tier selector
    step3-details/page.tsx     ← Couple info + wedding date
    step4-photos/page.tsx      ← Photo upload
    step5-payment/page.tsx     ← Order summary + Stripe checkout
  operator/
    dashboard/page.tsx         ← Operator dashboard (force-dynamic)
    orders/[id]/page.tsx       ← Single order detail
  my-order/page.tsx            ← Customer order tracking (magic link)
  approval/[token]/page.tsx    ← Design approval page
  api/
    trpc/[trpc]/route.ts       ← NEW tRPC HTTP endpoint
    orders/create/route.ts     ← Creates order + Stripe session + sends emails
    orders/[id]/...            ← complete, cancel, payment-link routes
    designs/[id]/...           ← approve, revision, preview, stl routes
    reviews/submit/route.ts    ← Review submission (multipart/formData)
    reviews/[id]/moderate/     ← Approve/reject reviews
    webhooks/stripe/route.ts   ← Stripe webhook handler
    uploads/presign/route.ts   ← R2 presigned upload URLs

lib/
  db.ts                        ← Prisma client (PrismaPg)
  auth.ts                      ← Auth.js config (JWT + credentials + magic link)
  order-pricing.ts             ← StyleTier type, ColorTier prices, calculateTotal()
  order-store.ts               ← localStorage order draft (client-side wizard state)
  reviews-data.ts              ← Static review data (shared /start + /reviews)
  trpc.ts                      ← NEW tRPC React hooks (createTRPCReact)
  stripe.ts                    ← Stripe client
  r2.ts                        ← Cloudflare R2 client

server/                        ← NEW tRPC server layer
  trpc.ts                      ← Context, procedures (public/protected/operator/admin)
  routers/
    _app.ts                    ← Root router
    orders.ts                  ← getByToken, getAll, getById, updateStatus, getStats
    reviews.ts                 ← list, getPending, moderate
    admin.ts                   ← listUsers, updateUserRole, getPlatformStats

components/
  providers/
    TRPCProvider.tsx           ← NEW React Query + tRPC client provider
  order/WizardLayout.tsx       ← Order wizard shell
  NotEdibleDisclaimer.tsx      ← "Not edible" warning component

prisma/schema.prisma           ← Database schema
ARCHITECTURE.md                ← Full SaaS platform architecture document
```

---

## 6. Everything Built Across All Sessions

### Session 1 (earlier)
- Full order wizard (5 steps: style → product → details → photos → payment)
- Stripe deposit checkout (50% now, 50% at design approval)
- Design approval flow with approval token email link
- Operator dashboard (view orders, update status, approve/reject reviews)
- Magic link order tracking for couples
- Static reviews page (`lib/reviews-data.ts` as shared source of truth)
- Review submission form (`/share-your-moment`)
- Contact page
- R2 file storage for photo uploads
- Resend email (order confirmation + operator alert on every order)

### Session 2 (recent)
- Added **4 couple images** to review cards (ids 2–5 in reviews-data.ts)
- Fixed **Jonathan & Shantay** featured review image (`/images/Couple6/couple6-jonathan-shantay.png`)
- Fixed **DB reviews overriding static reviews** — now always shows static reviews only
- Updated Jonathan & Shantay **wedding date to September 2026**
- Added **Prestige Scan tier** ($499 in-person 3D scanning):
  - Added to `StyleTier` type in `lib/order-pricing.ts`
  - Added to order wizard step 1 (gold/amber styling, routes to WhatsApp)
  - Added premium card to `/pricing` page (dark bg, gold border, $499)
  - WhatsApp CTA: routes to `https://wa.me/19546628622` with pre-filled message
- Wrote full **ARCHITECTURE.md** — system design, DB schema, RBAC, tRPC, partner model, 7-phase roadmap
- Installed **tRPC v11** foundation (Phase 1):
  - `server/trpc.ts` — procedures with RBAC enforcement
  - `server/routers/_app.ts` — root router
  - `server/routers/orders.ts` — query + mutation procedures
  - `server/routers/reviews.ts` — moderation procedures
  - `server/routers/admin.ts` — user management procedures
  - `app/api/trpc/[trpc]/route.ts` — single HTTP endpoint
  - `lib/trpc.ts` — typed client hooks
  - `components/providers/TRPCProvider.tsx` — provider wrapper
  - Updated `app/layout.tsx` to wrap with `<TRPCProvider>`
- Added `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@tanstack/react-query` to `package.json`
- **DNS fix** identified for wedprint3d.com (Namecheap):
  - A Record `@` needs to change from `216.198.79.1` → `76.76.21.21`
  - CNAME `www` needs to change to `cname.vercel-dns.com`

---

## 7. Pending Items (Do Before Phase 2)

1. **Run `npm install --legacy-peer-deps`** in the wedprint folder (tRPC packages added to package.json but not installed yet)
2. **Fix Namecheap DNS:**
   - A Record `@`: change `216.198.79.1` → `76.76.21.21`
   - CNAME `www`: change to `cname.vercel-dns.com`
3. **Restore Supabase** if DB is paused (free tier pauses after 7 days inactivity) — go to supabase.com/dashboard
4. **Add `PRESTIGE_SCAN` to Prisma enum** when ready to store Prestige orders in DB (currently routes to WhatsApp only)

---

## 8. Phase 2 — Partner Portal MVP

Per `ARCHITECTURE.md` Section 9, Phase 2 scope is:

### Goal
Onboard 5 beta partners (wedding photographers, planners, bridal boutiques) who can refer customers and earn commission.

### What Needs to Be Built

**Database changes (new Prisma models):**
- `Partner` — businessName, slug, ownerId, status, planKey, commissionRate, creditBalance
- `PartnerCustomer` — email, name, partnerId, source
- `CreditTransaction` — partnerId, amountCents, type (commission/debit/withdrawal)
- `PartnerInvoice` — for future subscription billing

**Partner registration flow:**
- `/partner/apply` — public application form (businessName, email, website, how they heard about us)
- Operator approves in dashboard → status changes `PENDING_APPROVAL` → `ACTIVE`
- Welcome email sent via Resend on approval

**Partner dashboard (`/partner/dashboard`):**
- Order list (their referred orders only)
- Revenue summary (total commission earned, pending, paid out)
- Referral link generator (`wedprint3d.com/?ref=PARTNER_SLUG`)
- Customer list (people they've referred)

**Attribution tracking:**
- Read `?ref=` query param on landing → store `partnerId` in localStorage/cookie
- Pass `partnerId` through order wizard → attach to `Order` on creation
- `Order` model needs `partnerId` field added

**Commission calculation:**
- When order status → `COMPLETE`, create `CreditTransaction` for partner
- Default rate: 10% of order total
- Show running balance in partner dashboard

**tRPC routers to add:**
- `server/routers/partners.ts` — `apply`, `getMyDashboard`, `getMyOrders`, `getMyCredits`
- Extend `server/routers/admin.ts` — `listPartners`, `approvePartner`, `suspendPartner`

**Partner email notifications:**
- Welcome email on approval
- "New order via your referral" notification
- Monthly commission summary

### Files to Create in Phase 2
```
app/partner/
  apply/page.tsx               ← Public application form
  dashboard/page.tsx           ← Partner home (stats + recent orders)
  orders/page.tsx              ← Full order list
  customers/page.tsx           ← Customer list
  earnings/page.tsx            ← Commission history
  layout.tsx                   ← Partner sidebar layout

server/routers/partners.ts     ← tRPC partner procedures
prisma/migrations/             ← Add Partner, PartnerCustomer, CreditTransaction models
```

### Files to Modify in Phase 2
```
prisma/schema.prisma           ← Add Partner, PartnerCustomer, CreditTransaction
app/api/orders/create/route.ts ← Read partnerId from request, attach to Order
app/order/step5-payment/page.tsx ← Pass partnerId from localStorage through order
server/routers/admin.ts        ← Add partner management procedures
app/operator/dashboard/page.tsx ← Add partner approval queue
```

### Partner Subscription Tiers (for reference)
| Tier | Price | Commission | Order Limit |
|---|---|---|---|
| Starter | Free | 8% | 5/mo |
| Professional | $49/mo | 12% | 50/mo |
| Studio | $149/mo | 18% | Unlimited |
| Enterprise | Custom | Negotiated | Unlimited |

Phase 2 focuses on **Starter tier only** (free, manual onboarding, no Stripe subscriptions yet — that's Phase 3).

---

## 9. Architecture Decisions Already Made

- **API layer:** tRPC v11 inside Next.js API routes (NOT NestJS) — migrate to standalone server in Phase 7 if needed
- **Monorepo:** Single Next.js app with route groups for now (NOT Turborepo yet)
- **Auth:** Auth.js v5 beta with JWT strategy — operator uses credentials provider, couples use magic link
- **Multi-tenancy:** `partnerId` on `Order` table — no separate DB per partner
- **Commission:** Credited to `CreditTransaction` ledger, not paid out automatically (manual withdrawal for now)
- **White-label:** Subdomain (`partner-slug.wedprint3d.com`) deferred to Phase 5 Studio tier

---

## 10. Master Prompt for New Chat Session

Paste this at the start of the new session:

```
You are the Lead Engineer for the WedPrint3D SaaS Platform.

Context files to read first:
- ARCHITECTURE.md — full system design, DB schema, RBAC, roadmap
- SESSION_HANDOFF.md — everything built so far + Phase 2 scope
- prisma/schema.prisma — current database schema
- server/trpc.ts — tRPC procedures and RBAC middleware
- server/routers/_app.ts — root tRPC router

Tech stack: Next.js 16 + TypeScript + tRPC v11 + Prisma 7 + Supabase PostgreSQL + Auth.js v5

We are starting Phase 2: Partner Portal MVP.

Goal: Build a partner registration flow, partner dashboard, referral attribution,
and commission tracking. 5 beta partners (free Starter tier, no Stripe subscriptions yet).

Rules:
1. Always read the schema before writing Prisma queries
2. All new API endpoints go through tRPC routers in /server/routers/
3. All mutations validated with Zod
4. RBAC enforced via tRPC middleware (operatorProcedure, adminProcedure)
5. PowerShell: never use && — run commands separately
6. npm install always needs --legacy-peer-deps flag
7. Never use console.log in new code — add a TODO comment instead
8. Always run git add -A then commit then push after completing a feature

Start by reading ARCHITECTURE.md Section 8 (Partner Business Model)
and SESSION_HANDOFF.md Section 8 (Phase 2 scope), then propose the
Prisma schema additions needed before writing any code.
```

---

*Document maintained by: QB / WedPrint3D*
*Architecture reference: ARCHITECTURE.md*
*Previous session summary: Available in Claude session history*
