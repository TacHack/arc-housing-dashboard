/**
 * Connection strings for Prisma CLI vs the running app.
 *
 * Vercel’s Neon integration sets:
 * - DATABASE_URL — pooled (hostname contains `-pooler`). The app uses this.
 * - DATABASE_URL_UNPOOLED — direct. `prisma migrate` and seed use this.
 *
 * DIRECT_URL is a manual alias for the direct string.
 * Local Postgres only needs DATABASE_URL; it is used for both.
 * The placeholder lets `prisma generate` run before a `.env` file exists.
 * It is not a real database.
 */
const PLACEHOLDER =
  "postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder?schema=public";

export function directDatabaseUrl(): string {
  const direct =
    process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DIRECT_URL?.trim();
  if (direct) return direct;
  const pooled = process.env.DATABASE_URL?.trim();
  if (pooled) return pooled;
  return PLACEHOLDER;
}

export function runtimeDatabaseUrl(): string {
  return process.env.DATABASE_URL?.trim() || directDatabaseUrl();
}
