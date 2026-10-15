# Sober Living CRM

Next.js (App Router) + Prisma + TypeScript scaffold for a Kipu-like sober living operations CRM: multi-tenant orgs, houses, beds, residents, audit logs, and house-scoped work orders.

## Prerequisites

- Node.js 20+
- PostgreSQL (for `db:push` / `db:seed` — not required to run the UI shell)

## Setup

```bash
cd /workspace/sober-living-crm
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL to your Postgres instance
```

Example `.env`:

```
DATABASE_URL="postgresql://user:pass@localhost:5432/sober_living_crm?schema=public"
```

## Database

```bash
npm run db:generate   # prisma generate
npm run db:push       # push schema (no migration files)
npm run db:seed       # Organization + admin + two houses with beds
```

Seed creates:

- Organization: **Summit Recovery Homes**
- Admin user: `admin@example.com` / name **Admin**
- Houses: **Oak Street House** (4 beds), **River Bend House** (3 beds)

## Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Routes

| Path | Notes |
|------|--------|
| `/` | Product shell + links |
| `/houses` | Mock house list until DB is connected |
| `/work-orders` | Placeholder — orders require a house |

## Scripts

| Script | Command |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run db:generate` | `prisma generate` |
| `npm run db:push` | `prisma db push` |
| `npm run db:seed` | `prisma db seed` (`tsx prisma/seed.ts`) |
| `npm run db:studio` | Prisma Studio |

## Design reference

Static HTML mock for the work-orders board:

`/workspace/sober-crm-mocks/work-orders.html`

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, ESLint
- Prisma 6 + PostgreSQL (`@prisma/client`)
