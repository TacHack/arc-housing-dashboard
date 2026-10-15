# ARC Housing Dashboard — Quick Start

Brand: **ARC Housing Dashboard** (sober living operations CRM).

## 1. Install PostgreSQL

Use a local install, or Docker:

```bash
docker run --name arc-pg -e POSTGRES_USER=sober -e POSTGRES_PASSWORD=sober -e POSTGRES_DB=sober_living_crm -p 5432:5432 -d postgres:16
```

## 2. Configure environment

```bash
cp .env.example .env
```

`.env.example` uses `postgresql://sober:sober@localhost:5432/sober_living_crm?schema=public` as a local-only example. Edit `.env` if your Postgres credentials differ.

## 3. Install and set up the database

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

## 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Seed creates org **Summit Recovery Homes**, admin `admin@example.com`, and two houses with beds.

## Features

Houses, residents (Meds / Notes / UA / **Contracts** tabs), work orders, and daily ops.

HTML design mocks (if packaged) live under `mocks/`.
