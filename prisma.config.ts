import "dotenv/config";
import { defineConfig } from "prisma/config";
import { directDatabaseUrl } from "./prisma/db-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    // Migrate and seed need a direct connection. The app uses the pooled URL.
    url: directDatabaseUrl(),
  },
});
