/**
 * Apply pending Prisma migrations during a Vercel build, then load sample
 * data on production (unless SEED_SAMPLE_DATA=0).
 *
 * Local `npm run build` does not run this. Preview deployments migrate the
 * Neon preview branch and skip sample data unless SEED_SAMPLE_DATA=1.
 */
import { execSync } from "node:child_process";
import { config } from "dotenv";

config({ quiet: true });

if (process.env.VERCEL !== "1") {
  console.log("vercel-build-db: not on Vercel, skipping migrate/seed");
  process.exit(0);
}

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
if (!databaseUrl) {
  console.error(
    [
      "DATABASE_URL is not set, so this build cannot migrate the database.",
      "Connect Neon Postgres to this Vercel project (Storage → Connect Project)",
      "for Production, Preview, and Development. Leave the env prefix empty so",
      "the names stay DATABASE_URL and DATABASE_URL_UNPOOLED, then redeploy",
      "with the build cache disabled.",
    ].join(" ")
  );
  process.exit(1);
}

const direct =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DIRECT_URL?.trim() || "";
if (databaseUrl.includes("-pooler") && !direct) {
  console.error(
    [
      "DATABASE_URL is a Neon pooled URL (the hostname contains -pooler) but",
      "DATABASE_URL_UNPOOLED is missing. prisma migrate deploy needs the direct",
      "connection. Reconnect the Neon integration without an environment-variable",
      "prefix, or set DATABASE_URL_UNPOOLED to the direct Neon URL, then redeploy.",
    ].join(" ")
  );
  process.exit(1);
}

execSync("npx prisma migrate deploy", { stdio: "inherit" });

const seedFlag = process.env.SEED_SAMPLE_DATA;
const seed =
  seedFlag === "1" || (seedFlag !== "0" && process.env.VERCEL_ENV === "production");

if (seed) {
  execSync("npx prisma db seed", { stdio: "inherit" });
} else {
  console.log(
    "vercel-build-db: schema migrated; sample seed skipped (set SEED_SAMPLE_DATA=1 to load it on this environment)"
  );
}
