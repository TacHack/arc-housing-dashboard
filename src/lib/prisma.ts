import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrisma() {
  const url = process.env.DATABASE_URL ?? "";
  if (url.includes("neon.tech")) {
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

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
