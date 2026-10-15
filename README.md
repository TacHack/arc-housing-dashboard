# ARC Housing Dashboard

Sober living operations CRM (houses, beds, residents, night check, meds, UA, notes, contracts, and house-scoped work orders).

Next.js App Router, TypeScript, Tailwind CSS, Prisma 6, PostgreSQL.

## Local setup

Requirements: Node.js 22 and PostgreSQL.

```bash
npm install
cp .env.example .env
npm run db:deploy
npm run dev
```

`db:deploy` applies `prisma/migrations` and loads sample data:

- Organization: **Summit Recovery Homes**
- Admin user: `admin@example.com`
- Houses: **Oak Street House** (4 beds), **River Bend House** (3 beds)
- Resident: **Jane Doe** on Oak Street, with two medications
- Work orders at Oak Street: leaky kitchen faucet, smoke detector battery

Open [http://localhost:3000](http://localhost:3000).

| Path | What it shows |
|------|----------------|
| `/` | Dashboard |
| `/houses` | Houses and beds |
| `/residents` | Residents, including Jane Doe after seeding |
| `/work-orders` | House-scoped work orders |
| `/daily-ops` | Night check and UA |

Other database scripts: `npm run db:migrate` (schema only), `npm run db:seed` (sample data only), `npm run db:studio`.

## Production on Vercel + Neon

This is the durable host. It is a normal Vercel project tied to this GitHub repository, with a Neon Postgres database billed through Vercel. It is not an anonymous `vercel deploy` preview (those expire and are not linked to the repo).

The GitHub repository owner (**TacHack**) has to do these steps. Vercel only lets the owner of a personal repository create the project. This agent cannot sign in to that Vercel or Neon account, and secrets are not stored in git.

1. Sign in to Vercel with the GitHub user **TacHack**: [Import this repository](https://vercel.com/new/clone?repository-url=https://github.com/TacHack/arc-housing-dashboard&project-name=arc-housing-dashboard).
2. Authorize the Vercel GitHub app for `TacHack/arc-housing-dashboard` if GitHub asks. Framework preset is Next.js. The repo `vercel.json` build command generates the Prisma client, runs `prisma migrate deploy`, seeds sample data on Production, then `next build`. Leave that command in place.
3. Deploy once. The first build fails until a database is connected. The log says `DATABASE_URL is not set`. That creates the Vercel project, which is what the next step attaches the database to.
4. Install Neon from the [Vercel Marketplace](https://vercel.com/marketplace/neon). Choose **Create New Neon Account** (billing stays on the Vercel invoice; the free plan is enough to start). Accept the terms, pick a region near the houses, and name the database (for example `arc-housing`). If you already have a Neon account you want to keep, choose **Link Existing Neon Account** instead of creating a second one.
5. In Vercel go to **Storage → that database → Connect Project**. Select `arc-housing-dashboard`. Enable **Production**, **Preview**, and **Development**. Leave the environment-variable prefix empty. Click **Connect**.
6. Confirm the project environment variables include `DATABASE_URL` (pooled, hostname contains `-pooler`) and `DATABASE_URL_UNPOOLED` (direct). Do not copy those values into git or into a chat. Optional: set `SEED_SAMPLE_DATA` to `0` only if you do not want the sample houses re-applied when they are missing.
7. Redeploy Production with the build cache **off** (Deployments → the failed deployment → Redeploy). The build migrates the schema and seeds Oak Street House, River Bend House, Jane Doe, and the two sample work orders.
8. Open the production URL shown on the Vercel project **Overview** page (Domains). Check `/houses`, `/residents`, and `/work-orders`.

After that, every push to `main` deploys Production, and pull requests get Preview deployments. With Neon preview branching enabled (Storage → Connect Project → Advanced → Preview), each preview gets its own database branch and the build migrates that branch. Previews are not seeded unless `SEED_SAMPLE_DATA=1`.

Sample seed is idempotent. A later production deploy adds Jane Doe or a sample work order only if that record is missing. It does not reset names, bed status, or work orders you already changed. Delete a sample work order by title and a future production deploy will create it again. Set `SEED_SAMPLE_DATA=0` to stop that.

One-off alternative from your own machine, after exporting the same URLs into the shell (do not commit them):

```bash
npm run db:deploy
```

### If you cannot use Vercel

Any Node 22 host plus Postgres works. Set `DATABASE_URL` to a direct Postgres URL (or set `DATABASE_URL` to the pooled Neon URL and `DATABASE_URL_UNPOOLED` to the direct one), then:

```bash
npm run db:deploy
npm run build
npm run start
```

Render, Railway, and Fly.io are the usual alternatives. You still need an account there. Point the host’s build command at `npm run vercel-build` only if that host sets `VERCEL=1`; otherwise migrate with `npm run db:deploy` before `npm run build`.

### Limits

Contract scans are written under `uploads/` on the server disk. Vercel functions do not keep that disk. Houses, residents, meds, notes, UA, night check, and work orders are in Postgres and do persist. A file store (Vercel Blob or S3) would be a separate change.

Do not set `NODE_ENV` yourself in the Vercel project settings. Vercel sets it, and forcing `production` during install can skip the packages the build needs.
