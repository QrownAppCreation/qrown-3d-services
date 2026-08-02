# WedPrint3D — Platform Architecture Blueprint
## Phase 1: System Design Document
**Version:** 1.0 | **Date:** August 2026 | **Model:** Claude Opus 5

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Technology Stack](#4-technology-stack)
5. [Database Schema](#5-database-schema)
6. [RBAC Security Model](#6-rbac-security-model)
7. [tRPC API Architecture](#7-trpc-api-architecture)
8. [Partner Business Model](#8-partner-business-model)
9. [Development Roadmap](#9-development-roadmap)
10. [Cost Estimates](#10-cost-estimates)

---

## 1. Executive Summary

WedPrint3D is being evolved from a single-product e-commerce site into a **Mass Customization SaaS Platform**. The first vertical is wedding cake toppers. The architecture must support:

- **Direct-to-consumer (D2C)** — couples ordering directly at wedprint3d.com
- **Partner channel** — wedding photographers, planners, and bridal boutiques reselling under their brand
- **White-label** — partners with their own domain, logo, and pricing
- **Operator/Admin** — internal production management, print queue, quality control

### Why tRPC + Next.js API Routes (not NestJS)

NestJS is the right choice at scale (50+ engineers, microservices). At this stage, tRPC inside Next.js gives:
- **Type safety end-to-end** — no manual API contract maintenance
- **Zero code generation** — types flow from server to client automatically
- **Faster iteration** — one codebase, one deploy
- **Migration path** — tRPC routers can be extracted to a standalone server later with minimal refactoring

This decision should be revisited when monthly order volume exceeds 5,000 or when a dedicated backend team is hired.

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE CDN                              │
│                    (DDoS protection, caching)                       │
└──────────────┬──────────────────┬──────────────────┬───────────────┘
               │                  │                  │
               ▼                  ▼                  ▼
    ┌──────────────────┐ ┌─────────────────┐ ┌──────────────────┐
    │  wedprint3d.com  │ │partners.wedprint│ │ admin.wedprint   │
    │  (Customer +     │ │     3d.com      │ │    3d.com        │
    │   Marketing)     │ │ (Partner Portal)│ │ (Admin + Ops)    │
    └────────┬─────────┘ └────────┬────────┘ └────────┬─────────┘
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │     Next.js App (Monorepo)  │
                    │   API Routes + tRPC Layer   │
                    └─────────────┬──────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
    ┌─────────▼──────┐  ┌────────▼────────┐  ┌──────▼────────┐
    │   PostgreSQL    │  │  Cloudflare R2  │  │     Redis      │
    │   (Supabase)   │  │  (File Storage) │  │  (BullMQ Jobs) │
    └────────────────┘  └─────────────────┘  └───────────────┘
              │
    ┌─────────▼──────────────────────────────────────┐
    │              External Services                  │
    │  Stripe | Resend | Twilio | Sentry | PostHog   │
    └─────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Monorepo vs Polyrepo | Monorepo (Turborepo) | Shared types, shared DB schema, single CI/CD |
| API layer | tRPC in Next.js | End-to-end type safety, faster iteration |
| Multi-portal | Route groups in one app OR subdomain apps | Start with route groups, split when team grows |
| Auth | Auth.js v5 (NextAuth) | Already installed, supports JWT + DB sessions |
| Job queue | BullMQ + Redis | Required for email, print queue, webhooks |
| File storage | Cloudflare R2 | Already configured, cheaper than S3 |
| Database | Supabase PostgreSQL | Already running, supports RLS for multi-tenancy |

---

## 3. Monorepo Structure

### Phase 1 (Current — Single App, Multi-Portal via Route Groups)

```
wedprint/                          ← Current repo, evolve in place
├── app/
│   ├── (marketing)/               ← Public marketing pages
│   │   ├── page.tsx               ← Homepage
│   │   ├── pricing/
│   │   ├── gallery/
│   │   └── reviews/
│   │
│   ├── (customer)/                ← Authenticated customer area
│   │   ├── order/                 ← Order wizard (current)
│   │   ├── my-order/              ← Order tracking
│   │   ├── approval/              ← Design approval
│   │   └── share-your-moment/     ← Review submission
│   │
│   ├── (partner)/                 ← NEW — Partner portal
│   │   ├── partner/
│   │   │   ├── dashboard/
│   │   │   ├── customers/
│   │   │   ├── orders/
│   │   │   ├── analytics/
│   │   │   ├── billing/
│   │   │   └── settings/
│   │   └── layout.tsx             ← Partner layout (sidebar nav)
│   │
│   ├── (admin)/                   ← Existing operator → upgraded admin
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   ├── production/        ← NEW — print queue
│   │   │   ├── partners/          ← NEW — manage partners
│   │   │   ├── users/             ← NEW — user management
│   │   │   └── analytics/
│   │   └── layout.tsx
│   │
│   └── api/
│       ├── trpc/
│       │   └── [trpc]/
│       │       └── route.ts       ← Single tRPC HTTP endpoint
│       └── webhooks/
│           ├── stripe/
│           └── shipping/
│
├── server/                        ← NEW — tRPC server layer
│   ├── trpc.ts                    ← tRPC init, context, middleware
│   ├── routers/
│   │   ├── _app.ts                ← Root router (combines all)
│   │   ├── auth.ts
│   │   ├── orders.ts
│   │   ├── designs.ts
│   │   ├── partners.ts
│   │   ├── products.ts
│   │   ├── payments.ts
│   │   ├── shipping.ts
│   │   ├── admin.ts
│   │   └── analytics.ts
│   └── middleware/
│       ├── auth.ts                ← requireAuth, requireRole
│       └── rateLimit.ts
│
├── lib/                           ← Existing utilities (extend)
│   ├── db.ts                      ← Prisma client
│   ├── auth.ts                    ← Auth.js config
│   ├── stripe.ts                  ← Stripe client
│   ├── r2.ts                      ← Cloudflare R2 client
│   ├── email.ts                   ← Resend email client
│   ├── queue.ts                   ← NEW — BullMQ setup
│   └── redis.ts                   ← NEW — Redis client
│
├── prisma/
│   └── schema.prisma              ← Extended schema (see Section 5)
│
└── workers/                       ← NEW — Background job workers
    ├── email.worker.ts
    ├── print-queue.worker.ts
    └── webhook.worker.ts
```

### Phase 2 (Future — Turborepo Monorepo when team grows)

```
wedprint-platform/
├── apps/
│   ├── web/          ← Extract current app here
│   ├── partner/      ← Separate Next.js app (partners.wedprint3d.com)
│   └── admin/        ← Separate Next.js app (admin.wedprint3d.com)
├── packages/
│   ├── db/           ← Shared Prisma schema
│   ├── ui/           ← Shared component library
│   ├── trpc/         ← Shared tRPC router types
│   └── config/       ← Shared ESLint, TypeScript configs
└── turbo.json
```

---

## 4. Technology Stack

### Core Stack (Confirmed)

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 16 (App Router) | Already deployed |
| Language | TypeScript | 5.x | Strict mode |
| UI | Tailwind CSS v4 + shadcn/ui | Latest | Already configured |
| ORM | Prisma | 6.x | Already configured |
| Database | PostgreSQL (Supabase) | 15+ | Already running |
| Auth | Auth.js (NextAuth) | v5 | Upgrade from v4 |
| Payments | Stripe | Latest | Already configured |
| Storage | Cloudflare R2 | — | Already configured |
| Email | Resend | Latest | Replace nodemailer |
| API | tRPC | v11 | NEW — to be added |

### New Dependencies (Phase 1–3)

| Package | Purpose |
|---|---|
| `@trpc/server` + `@trpc/client` + `@trpc/next` | Type-safe API layer |
| `@trpc/react-query` | Client-side data fetching |
| `zod` | Input validation (tRPC schemas) |
| `ioredis` | Redis client for BullMQ |
| `bullmq` | Background job processing |
| `@upstash/redis` | Serverless Redis (Vercel-compatible) |
| `resend` | Transactional email (replace nodemailer) |
| `@sentry/nextjs` | Error tracking |
| `posthog-js` + `posthog-node` | Product analytics |

### Deferred to Later Phases

| Technology | Phase | Notes |
|---|---|---|
| Twilio | Phase 5 | SMS notifications |
| Meilisearch | Phase 6 | Design marketplace search |
| Three.js | Phase 6 | 3D preview in browser |
| OpenAI / Flux | Phase 6 | AI design generation |
| Grafana | Phase 7 | Infrastructure monitoring |
| Kubernetes | Phase 8 | Only if self-hosting at scale |

---

## 5. Database Schema

### Design Principles

1. **Soft deletes everywhere** — `deletedAt DateTime?` on all major entities
2. **Audit trail** — `createdAt`, `updatedAt` on every table
3. **Multi-tenancy via Partner** — all customer-facing data has optional `partnerId`
4. **UUID primary keys** — `@id @default(cuid())` for security
5. **Enum for status fields** — never use raw strings for state machines

```prisma
// prisma/schema.prisma (full extended schema)

generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── ENUMS ────────────────────────────────────────────────────────────────────

enum UserRole {
  CUSTOMER
  PARTNER
  PARTNER_ADMIN
  OPERATOR
  ADMIN
  SUPER_ADMIN
}

enum OrderStatus {
  PENDING_PAYMENT
  PAID
  IN_DESIGN
  AWAITING_APPROVAL
  APPROVED
  BALANCE_PAID
  PRINTING
  QUALITY_CHECK
  SHIPPED
  DELIVERED
  COMPLETE
  CANCELLED
  REFUNDED
}

enum PartnerPlanKey {
  STARTER     // Free
  PROFESSIONAL // $49/mo
  STUDIO      // $149/mo
  ENTERPRISE  // Custom
}

enum PartnerStatus {
  PENDING_APPROVAL
  ACTIVE
  SUSPENDED
  CANCELLED
}

enum ProductCategory {
  CAKE_TOPPER
  BRIDAL_GIFT
  GUEST_FAVOR
  FRIDGE_MAGNET
  PET_FIGURINE
  CORPORATE_AWARD
  MEMORIAL
}

enum ColorTier {
  CLASSIC
  DUO
  SIGNATURE
  HEIRLOOM
  PRESTIGE_SCAN
}

enum ShippingCarrier {
  UPS
  USPS
  FEDEX
  DHL
  LOCAL
}

enum ShippingStatus {
  LABEL_CREATED
  PICKED_UP
  IN_TRANSIT
  OUT_FOR_DELIVERY
  DELIVERED
  EXCEPTION
}

enum NotificationType {
  ORDER_PLACED
  DESIGN_READY
  APPROVAL_NEEDED
  APPROVED
  SHIPPED
  DELIVERED
  REVIEW_REQUEST
  PARTNER_WELCOME
  PARTNER_PAYMENT
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  ROLE_CHANGE
  PAYMENT
  REFUND
  APPROVE
  REJECT
}

// ─── USERS ───────────────────────────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  role          UserRole  @default(CUSTOMER)
  passwordHash  String?
  twoFactorSecret String?
  twoFactorEnabled Boolean @default(false)

  // Stripe
  stripeCustomerId String? @unique

  // Partner membership (if user belongs to a partner org)
  partnerId     String?
  partner       Partner? @relation("PartnerMembers", fields: [partnerId], references: [id])

  // Relations
  accounts      Account[]
  sessions      Session[]
  orders        Order[]
  reviews       Review[]
  auditLogs     AuditLog[]
  notifications Notification[]
  ownedPartner  Partner?  @relation("PartnerOwner")

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  @@index([email])
  @@index([partnerId])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── PARTNERS ────────────────────────────────────────────────────────────────

model Partner {
  id            String        @id @default(cuid())
  ownerId       String        @unique
  owner         User          @relation("PartnerOwner", fields: [ownerId], references: [id])

  // Business details
  businessName  String
  slug          String        @unique  // Used for subdomain/white-label URL
  logo          String?
  website       String?
  phone         String?
  address       Json?         // { street, city, state, zip, country }

  // Status
  status        PartnerStatus @default(PENDING_APPROVAL)
  approvedAt    DateTime?
  approvedBy    String?       // Admin user ID

  // Subscription
  planKey       PartnerPlanKey @default(STARTER)
  stripeSubscriptionId String? @unique
  stripeCustomerId     String? @unique
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean @default(false)

  // White-label settings
  customDomain  String?       @unique
  brandColor    String?       // Hex color
  brandFont     String?

  // Commission & billing
  commissionRate Float        @default(0.10) // 10% default
  creditBalance  Int          @default(0)    // In cents

  // Members
  members       User[]        @relation("PartnerMembers")

  // Relations
  orders        Order[]       @relation("PartnerOrders")
  customers     PartnerCustomer[]
  invoices      PartnerInvoice[]
  credits       CreditTransaction[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  @@index([slug])
  @@index([status])
}

model PartnerCustomer {
  id          String  @id @default(cuid())
  partnerId   String
  partner     Partner @relation(fields: [partnerId], references: [id])

  // Customer info (may or may not have a User account)
  email       String
  name        String?
  phone       String?
  notes       String?

  // Attribution
  referralCode String?
  source       String?  // "business_card", "instagram", "referral"

  orders      Order[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([partnerId, email])
  @@index([partnerId])
}

model PartnerInvoice {
  id          String  @id @default(cuid())
  partnerId   String
  partner     Partner @relation(fields: [partnerId], references: [id])

  stripeInvoiceId String? @unique
  amountCents     Int
  status          String  // draft, open, paid, void
  dueDate         DateTime?
  paidAt          DateTime?
  description     String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model CreditTransaction {
  id          String  @id @default(cuid())
  partnerId   String
  partner     Partner @relation(fields: [partnerId], references: [id])

  amountCents Int     // Positive = credit, negative = debit
  type        String  // "commission", "refund", "manual", "withdrawal"
  description String?
  orderId     String?
  order       Order?  @relation(fields: [orderId], references: [id])

  createdAt   DateTime @default(now())
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

model Product {
  id          String          @id @default(cuid())
  name        String
  slug        String          @unique
  category    ProductCategory
  description String?
  active      Boolean         @default(true)

  variants    ProductVariant[]
  orderItems  OrderItem[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ProductVariant {
  id            String  @id @default(cuid())
  productId     String
  product       Product @relation(fields: [productId], references: [id])

  colorTier     ColorTier
  name          String    // e.g. "Classic 1-Color Cake Topper"
  priceCents    Int
  compareAtCents Int?     // Strikethrough price
  active        Boolean  @default(true)

  // Production metadata
  filamentCount Int      @default(1)
  printHours    Float?   // Estimated print time
  requiresX1C   Boolean  @default(false)

  orderItems    OrderItem[]

  @@unique([productId, colorTier])
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

model Order {
  id          String      @id @default(cuid())

  // Who placed it
  userId      String?
  user        User?       @relation(fields: [userId], references: [id])

  // Guest / partner customer
  partnerCustomerId String?
  partnerCustomer   PartnerCustomer? @relation(fields: [partnerCustomerId], references: [id])

  // Partner attribution
  partnerId   String?
  partner     Partner?    @relation("PartnerOrders", fields: [partnerId], references: [id])

  // Customer contact (denormalized for speed)
  customerEmail String
  customerName  String?
  customerPhone String?

  // Couple details
  coupleId    String?
  couple      Couple?     @relation(fields: [coupleId], references: [id])

  // Order details
  status      OrderStatus @default(PENDING_PAYMENT)
  colorTier   ColorTier?
  styleTier   String?
  weddingDate DateTime?
  styleNotes  String?     @db.Text
  colorPalette String?

  // Pricing (in cents)
  subtotalCents    Int     @default(0)
  discountCents    Int     @default(0)
  shippingCents    Int     @default(0)
  taxCents         Int     @default(0)
  totalCents       Int     @default(0)
  depositCents     Int     @default(0)
  balanceCents     Int     @default(0)
  paidCents        Int     @default(0)

  // Stripe
  stripePaymentIntentId  String? @unique
  stripeDepositIntentId  String? @unique

  // Approval token (for email link approval flow)
  approvalToken   String?  @unique
  approvedAt      DateTime?

  // Items
  items           OrderItem[]
  designs         Design[]
  addOns          OrderAddOn[]
  shipments       Shipment[]
  payments        Payment[]
  creditTransactions CreditTransaction[]
  notifications   Notification[]

  // Rush
  isRush          Boolean  @default(false)
  rushDeadline    DateTime?

  // Internal notes
  operatorNotes   String?  @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  @@index([status])
  @@index([partnerId])
  @@index([userId])
  @@index([customerEmail])
}

model OrderItem {
  id          String         @id @default(cuid())
  orderId     String
  order       Order          @relation(fields: [orderId], references: [id])
  productId   String
  product     Product        @relation(fields: [productId], references: [id])
  variantId   String
  variant     ProductVariant @relation(fields: [variantId], references: [id])

  quantity    Int            @default(1)
  unitCents   Int
  totalCents  Int

  createdAt   DateTime @default(now())
}

model OrderAddOn {
  id      String @id @default(cuid())
  orderId String
  order   Order  @relation(fields: [orderId], references: [id])

  type        String  // HAND_PAINTING, GIFT_BOX, ENGRAVED_BASE, RUSH_ORDER, STL_LICENSE
  priceCents  Int
  quantity    Int     @default(1)
}

// ─── DESIGNS ─────────────────────────────────────────────────────────────────

model Design {
  id          String  @id @default(cuid())
  orderId     String
  order       Order   @relation(fields: [orderId], references: [id])

  category    String  // CAKE_TOPPER, BRIDAL_GIFT, etc.
  quantity    Int     @default(1)

  // File URLs (Cloudflare R2)
  renderUrl   String?
  stlUrl      String?
  productionFileUrl String?

  // Revision tracking
  revisionNumber Int    @default(1)
  parentDesignId String?

  // Status
  approvedAt  DateTime?
  approvedBy  String?   // "customer" or "operator"
  rejectedAt  DateTime?
  rejectionReason String?

  // Photos submitted by customer
  photos      DesignPhoto[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model DesignPhoto {
  id        String  @id @default(cuid())
  designId  String
  design    Design  @relation(fields: [designId], references: [id])

  url       String
  type      String  // "partner1", "partner2", "outfit", "pet", "inspiration"
  fileName  String?
  fileSizeBytes Int?

  createdAt DateTime @default(now())
}

// ─── COUPLES ─────────────────────────────────────────────────────────────────

model Couple {
  id            String   @id @default(cuid())
  name          String
  email         String
  phone         String?
  weddingDate   DateTime?
  orders        Order[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

model Payment {
  id          String  @id @default(cuid())
  orderId     String
  order       Order   @relation(fields: [orderId], references: [id])

  stripePaymentIntentId String  @unique
  amountCents Int
  type        String  // "deposit", "balance", "full", "refund"
  status      String  // "pending", "succeeded", "failed", "refunded"

  paidAt      DateTime?
  refundedAt  DateTime?
  refundCents Int      @default(0)

  createdAt   DateTime @default(now())
}

// ─── SHIPPING ────────────────────────────────────────────────────────────────

model Shipment {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])

  carrier   ShippingCarrier @default(USPS)
  trackingNumber String?
  labelUrl  String?
  status    ShippingStatus  @default(LABEL_CREATED)

  // Address (JSON for flexibility)
  toAddress  Json
  fromAddress Json?

  // Costs
  rateCents  Int?
  weightOz   Float?

  estimatedDelivery DateTime?
  deliveredAt       DateTime?

  events    ShipmentEvent[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ShipmentEvent {
  id          String   @id @default(cuid())
  shipmentId  String
  shipment    Shipment @relation(fields: [shipmentId], references: [id])

  status      String
  description String
  location    String?
  occurredAt  DateTime

  createdAt   DateTime @default(now())
}

// ─── PRODUCTION ──────────────────────────────────────────────────────────────

model PrintJob {
  id          String  @id @default(cuid())
  orderId     String
  designId    String

  // Printer assignment
  printerId   String?
  printer     Printer? @relation(fields: [printerId], references: [id])

  // Job details
  colorTier   ColorTier
  filamentColors Int    @default(1)
  estimatedHours Float?
  actualHours    Float?

  // Status
  status      String   // queued, printing, paused, complete, failed
  startedAt   DateTime?
  completedAt DateTime?
  failureReason String?

  // Quality control
  qcPassedAt  DateTime?
  qcFailedAt  DateTime?
  qcNotes     String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status])
  @@index([printerId])
}

model Printer {
  id          String   @id @default(cuid())
  name        String
  model       String   // "Bambu X1C", "Bambu P1S", etc.
  maxColors   Int      @default(1)
  active      Boolean  @default(true)
  location    String?  // physical location label
  notes       String?

  printJobs   PrintJob[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

model Review {
  id          String   @id @default(cuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])

  coupleName  String
  rating      Int      @default(5)
  comment     String   @db.Text
  weddingDate DateTime?

  // Media
  photoUrl    String?
  cakePhotoUrl String?

  // Moderation
  approved    Boolean  @default(false)
  approvedAt  DateTime?
  approvedBy  String?

  // Partner attribution
  partnerId   String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

model Notification {
  id        String           @id @default(cuid())
  userId    String?
  user      User?            @relation(fields: [userId], references: [id])
  orderId   String?
  order     Order?           @relation(fields: [orderId], references: [id])

  type      NotificationType
  channel   String           // "email", "sms", "in_app"
  subject   String?
  body      String?          @db.Text
  sentAt    DateTime?
  readAt    DateTime?
  error     String?

  createdAt DateTime @default(now())
}

// ─── AUDIT LOG ───────────────────────────────────────────────────────────────

model AuditLog {
  id          String      @id @default(cuid())
  userId      String?
  user        User?       @relation(fields: [userId], references: [id])

  action      AuditAction
  entity      String      // Table name: "Order", "User", "Partner", etc.
  entityId    String
  before      Json?       // State before change
  after       Json?       // State after change
  ipAddress   String?
  userAgent   String?

  createdAt   DateTime @default(now())

  @@index([entity, entityId])
  @@index([userId])
}

// ─── COUPONS ─────────────────────────────────────────────────────────────────

model Coupon {
  id            String   @id @default(cuid())
  code          String   @unique
  description   String?

  // Discount type
  discountType  String   // "percent" | "fixed"
  discountValue Int      // Percentage (0-100) or cents

  // Restrictions
  minOrderCents Int?
  maxUsages     Int?
  usageCount    Int      @default(0)
  partnerId     String?  // Partner-specific coupon
  onePerCustomer Boolean @default(true)

  // Validity
  startsAt      DateTime?
  expiresAt     DateTime?
  active        Boolean  @default(true)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([code])
}
```

---

## 6. RBAC Security Model

### Role Hierarchy

```
SUPER_ADMIN
    └── ADMIN
            └── OPERATOR
                    └── PARTNER_ADMIN
                                └── PARTNER
                                        └── CUSTOMER
```

### Permission Matrix

| Permission | CUSTOMER | PARTNER | PARTNER_ADMIN | OPERATOR | ADMIN | SUPER_ADMIN |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| View own orders | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Place orders | ✅ | ✅ | ✅ | — | — | — |
| Approve own design | ✅ | ✅ | ✅ | — | — | — |
| View partner customers | — | ✅ | ✅ | — | ✅ | ✅ |
| View partner analytics | — | ✅ | ✅ | — | ✅ | ✅ |
| Manage partner users | — | — | ✅ | — | ✅ | ✅ |
| View all orders | — | — | — | ✅ | ✅ | ✅ |
| Update order status | — | — | — | ✅ | ✅ | ✅ |
| Manage print queue | — | — | — | ✅ | ✅ | ✅ |
| Approve reviews | — | — | — | ✅ | ✅ | ✅ |
| Manage partners | — | — | — | — | ✅ | ✅ |
| Manage users | — | — | — | — | ✅ | ✅ |
| Manage products | — | — | — | — | ✅ | ✅ |
| View financials | — | — | — | — | ✅ | ✅ |
| Issue refunds | — | — | — | — | ✅ | ✅ |
| Change user roles | — | — | — | — | — | ✅ |
| Delete any record | — | — | — | — | — | ✅ |

### tRPC Middleware Implementation

```typescript
// server/middleware/auth.ts

export const requireAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});

export const requireRole = (...roles: UserRole[]) =>
  requireAuth.unstable_pipe(({ ctx, next }) => {
    if (!roles.includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next();
  });

// Usage in routers:
export const adminProcedure = t.procedure.use(requireRole("ADMIN", "SUPER_ADMIN"));
export const operatorProcedure = t.procedure.use(requireRole("OPERATOR", "ADMIN", "SUPER_ADMIN"));
export const partnerProcedure = t.procedure.use(requireRole("PARTNER", "PARTNER_ADMIN", "ADMIN", "SUPER_ADMIN"));
```

---

## 7. tRPC API Architecture

### Router Structure

```typescript
// server/routers/_app.ts
export const appRouter = createTRPCRouter({
  auth:      authRouter,       // login, register, 2FA, tokens
  orders:    ordersRouter,     // CRUD orders, status updates
  designs:   designsRouter,    // upload photos, approve designs
  products:  productsRouter,   // product catalog
  partners:  partnersRouter,   // partner management
  payments:  paymentsRouter,   // Stripe intents, webhooks
  shipping:  shippingRouter,   // labels, tracking
  reviews:   reviewsRouter,    // submit, approve, list
  admin:     adminRouter,      // admin-only operations
  analytics: analyticsRouter,  // metrics, reports
});
```

### Example Router (Orders)

```typescript
// server/routers/orders.ts
export const ordersRouter = createTRPCRouter({

  // Public — customers get their own orders
  getMyOrders: protectedProcedure
    .query(({ ctx }) => ctx.db.order.findMany({
      where: { userId: ctx.user.id },
      include: { items: true, designs: true, shipments: true },
    })),

  // Customer — place a new order
  create: protectedProcedure
    .input(CreateOrderSchema)
    .mutation(({ ctx, input }) => createOrder(ctx, input)),

  // Partner — view partner's orders
  getPartnerOrders: partnerProcedure
    .input(z.object({ page: z.number().default(1) }))
    .query(({ ctx, input }) => ctx.db.order.findMany({
      where: { partnerId: ctx.user.partnerId },
      skip: (input.page - 1) * 20,
      take: 20,
    })),

  // Operator — update order status
  updateStatus: operatorProcedure
    .input(z.object({
      orderId: z.string(),
      status: z.nativeEnum(OrderStatus),
      notes: z.string().optional(),
    }))
    .mutation(({ ctx, input }) => updateOrderStatus(ctx, input)),

  // Admin — get all orders with filters
  getAll: adminProcedure
    .input(GetAllOrdersSchema)
    .query(({ ctx, input }) => getAllOrders(ctx, input)),
});
```

### API Endpoint

```typescript
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
  });

export { handler as GET, handler as POST };
```

---

## 8. Partner Business Model

### Subscription Tiers

| Feature | Starter (Free) | Professional ($49/mo) | Studio ($149/mo) | Enterprise (Custom) |
|---|:---:|:---:|:---:|:---:|
| Orders per month | 5 | 50 | Unlimited | Unlimited |
| Commission rate | 8% | 12% | 18% | Negotiated |
| Branded referral link | ✅ | ✅ | ✅ | ✅ |
| Partner dashboard | ✅ | ✅ | ✅ | ✅ |
| Customer management | — | ✅ | ✅ | ✅ |
| Analytics & reports | — | ✅ | ✅ | ✅ |
| White-label portal | — | — | ✅ | ✅ |
| Custom domain | — | — | ✅ | ✅ |
| Custom pricing | — | — | ✅ | ✅ |
| API access | — | — | — | ✅ |
| Dedicated support | — | — | — | ✅ |
| Billing terms | — | Monthly/Annual | Monthly/Annual | Invoiced |

### How Partners Earn

**Commission Model (default):**
- Partner shares referral link or places order on behalf of customer
- WedPrint3D fulfills the order
- Commission is credited to partner balance at order completion
- Partner can withdraw via bank transfer or apply credits to future orders

**Wholesale Model (Studio+):**
- Partner buys at wholesale price (list price minus commission %)
- Partner invoices the customer directly at their own markup
- WedPrint3D never sees the end customer price

### Customer Attribution

```
1. Partner shares: wedprint3d.com/?ref=PARTNER_SLUG
   or: partner-brand.wedprint3d.com (white-label)
   or: customdomain.com (Studio+)

2. Customer places order → Order.partnerId = partner.id

3. Order completes → CreditTransaction created for commission

4. Partner dashboard shows: revenue, commissions, pending orders
```

---

## 9. Development Roadmap

### Current State Audit

The existing codebase is a solid foundation. Key existing capabilities:
- ✅ Next.js 16 App Router with TypeScript
- ✅ Prisma + Supabase PostgreSQL
- ✅ Auth.js authentication (basic)
- ✅ Stripe payment processing (deposit model)
- ✅ Cloudflare R2 file storage
- ✅ Order wizard (5 steps)
- ✅ Operator dashboard
- ✅ Reviews system
- ✅ Design approval flow

### Gaps to Fill

| Gap | Priority | Effort |
|---|---|---|
| No tRPC layer | High | Medium |
| No 2FA / OAuth | High | Low |
| No RBAC enforcement | High | Medium |
| No partner portal | High | Large |
| No Stripe subscriptions | High | Medium |
| No background jobs (BullMQ) | Medium | Medium |
| No audit logs | Medium | Small |
| No production queue UI | Medium | Medium |
| No shipping integrations | Low | Large |
| No AI design studio | Low | X-Large |

### Phase-by-Phase Plan

---

#### Phase 1 — Foundation (Weeks 1–4) ← YOU ARE HERE
**Model: Claude Opus 5 (planning) + Claude Sonnet 5 (execution)**

- [x] Architecture document (this file)
- [ ] Install and configure tRPC
- [ ] Migrate existing API routes to tRPC routers
- [ ] Upgrade Auth.js to v5
- [ ] Implement RBAC middleware
- [ ] Add 2FA support
- [ ] Extend Prisma schema with new entities
- [ ] Set up Redis + BullMQ
- [ ] Replace nodemailer with Resend
- [ ] Add Sentry error tracking

**Milestone:** All existing functionality works through tRPC. RBAC enforced.

---

#### Phase 2 — Partner Portal MVP (Weeks 5–10)
**Model: Claude Sonnet 5 + Claude Code**

- [ ] Partner registration + approval flow
- [ ] Partner dashboard (orders, revenue summary)
- [ ] Customer management (add/view/tag customers)
- [ ] Referral link + attribution tracking
- [ ] Commission calculation + credit balance
- [ ] Partner email notifications
- [ ] Basic analytics (order count, revenue, avg order value)

**Milestone:** 5 beta partners onboarded. Commission payments processing.

---

#### Phase 3 — Stripe Subscriptions (Weeks 8–12)
**Model: Claude Sonnet 5 + Claude Code**

- [ ] Partner subscription plans in Stripe
- [ ] Subscription creation, upgrade, downgrade
- [ ] Webhook handling for payment events
- [ ] Partner billing dashboard
- [ ] Coupon/discount system
- [ ] Commission withdrawal requests

**Milestone:** Partners paying monthly subscription. Revenue > $500/mo from subscriptions.

---

#### Phase 4 — Production Management (Weeks 12–16)
**Model: Claude Sonnet 5 + Claude Code**

- [ ] Print job queue with BullMQ
- [ ] Printer management (register printers, capacity)
- [ ] Production dashboard (queue, in-progress, done)
- [ ] Quality control checklist
- [ ] Operator assignment and notes
- [ ] Shipping label generation (EasyPost integration)
- [ ] Automated tracking updates

**Milestone:** Zero orders lost in production. Full paper trail on every job.

---

#### Phase 5 — Scale & Analytics (Weeks 16–22)
**Model: Claude Sonnet 5 + Claude Code**

- [ ] PostHog product analytics
- [ ] Partner analytics deep-dive (CLV, conversion, churn)
- [ ] Admin financial reports (MRR, ARR, cohort analysis)
- [ ] Automated email sequences (post-order, review request, win-back)
- [ ] SMS notifications via Twilio
- [ ] Referral program (customer referrals, not just partner)
- [ ] White-label portal for Studio+ partners
- [ ] Custom domain support

**Milestone:** Full visibility into business metrics. Partner NPS > 8.

---

#### Phase 6 — AI Design Studio (Weeks 22–32)
**Model: Claude Opus 5 (design) + Claude Sonnet 5 (build)**

- [ ] Photo upload + AI face analysis
- [ ] Automated 3D model generation pipeline
- [ ] In-browser 3D preview (Three.js)
- [ ] Revision request system with annotations
- [ ] Design marketplace (browse community designs)
- [ ] AI style recommendations

**Milestone:** 50% reduction in design turnaround time.

---

#### Phase 7 — Enterprise & Marketplace (Weeks 32+)
**Model: Claude Sonnet 5 + Claude Code**

- [ ] API documentation (OpenAPI + Swagger)
- [ ] Partner API access (Studio+ tier)
- [ ] Multi-product catalog (figurines, awards, etc.)
- [ ] Inventory management
- [ ] Advanced shipping (multi-carrier rate shopping)
- [ ] Kubernetes deployment option
- [ ] SOC 2 compliance preparation

---

### Time & Cost Summary

| Phase | Duration | Estimated Cost (Claude Code) | Outcome |
|---|---|---|---|
| 1 — Foundation | 4 weeks | ~$200 | Type-safe API, RBAC, 2FA |
| 2 — Partner Portal | 6 weeks | ~$400 | 5 beta partners |
| 3 — Subscriptions | 4 weeks | ~$250 | Subscription revenue |
| 4 — Production | 4 weeks | ~$250 | Operational efficiency |
| 5 — Analytics | 6 weeks | ~$400 | Full business visibility |
| 6 — AI Studio | 10 weeks | ~$800 | Differentiated product |
| 7 — Enterprise | Ongoing | Ongoing | Platform scale |

---

## 10. Cost Estimates

### Infrastructure (Monthly at 1,000 orders/mo)

| Service | Plan | Monthly Cost |
|---|---|---|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| Upstash Redis | Pay-per-use | ~$5 |
| Cloudflare R2 | Pay-per-use | ~$5 |
| Resend | Starter | $20 |
| Sentry | Team | $26 |
| PostHog | Scale | $0–$450 |
| **Total** | | **~$100–$550/mo** |

### Infrastructure (Monthly at 10,000 orders/mo)

| Service | Plan | Monthly Cost |
|---|---|---|
| Vercel | Enterprise | $400+ |
| Supabase | Team | $599 |
| Upstash Redis | Pro | $80 |
| Cloudflare R2 | Pay-per-use | ~$30 |
| Resend | Business | $90 |
| Sentry | Business | $80 |
| PostHog | Scale | $450 |
| **Total** | | **~$1,700/mo** |

At 10,000 orders/mo at $99 avg order value = **$990,000/mo revenue**. Infrastructure at $1,700 = **0.17% of revenue**. Entirely reasonable.

---

## Appendix: Master Prompt for Claude Code Sessions

Use this prompt at the start of every Claude Code implementation session:

```
You are the Lead Engineer for the WedPrint3D SaaS Platform.

Architecture reference: ARCHITECTURE.md (always consult before coding)
Tech stack: Next.js 16 + TypeScript + tRPC + Prisma + Supabase + Auth.js v5

Rules:
1. All API endpoints go through tRPC routers in /server/routers/
2. All database access goes through Prisma — never raw SQL
3. All user input validated with Zod schemas
4. All mutations create an AuditLog entry
5. Roles are enforced via tRPC middleware (requireRole)
6. Never expose internal IDs in public URLs — use slugs or tokens
7. All file uploads go to Cloudflare R2 — never local disk
8. Errors are caught and logged to Sentry before re-throwing
9. Comment every exported function with JSDoc
10. No console.log in production code — use a logger

Current phase: [PHASE NUMBER AND NAME]
Current task: [SPECIFIC TASK]
```

---

*Document maintained by: QB / WedPrint3D*
*Next review: After Phase 1 completion*
