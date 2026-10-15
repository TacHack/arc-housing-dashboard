import { PrismaClient } from "@prisma/client";
import { runtimeDatabaseUrl } from "../../prisma/db-url";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrisma() {
  const url = runtimeDatabaseUrl();
  if (url.includes("neon.tech")) {
    if (process.env.NODE_ENV === "production" && !url.includes("-pooler")) {
      console.warn(
        "DATABASE_URL points at Neon without the pooler hostname. Use the pooled URL (contains -pooler) for the app. Migrations use DATABASE_URL_UNPOOLED."
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neonConfig } = require("@neondatabase/serverless") as typeof import("@neondatabase/serverless");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaNeon } = require("@prisma/adapter-neon") as typeof import("@prisma/adapter-neon");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ws = require("ws");
    neonConfig.webSocketConstructor = ws as unknown as typeof neonConfig.webSocketConstructor;
    const adapter = new PrismaNeon({ connectionString: url });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrisma();
  }
  return globalForPrisma.prisma;
}

// Construct the client on first query so `next build` can import pages
// before a database is reachable. The Neon adapter is still used at runtime.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
