import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { directDatabaseUrl } from "./db-url";
import { seedSampleData } from "./sample-data";

const prisma = new PrismaClient({ datasourceUrl: directDatabaseUrl() });

async function main() {
  const { org, admin, oak, river, jane } = await seedSampleData(prisma);
  const [bedCount, workOrderCount] = await Promise.all([
    prisma.bed.count({ where: { orgId: org.id } }),
    prisma.workOrder.count({ where: { houseId: oak.id } }),
  ]);

  console.log("Seed complete:");
  console.log(`  Organization: ${org.name} (${org.id})`);
  console.log(`  Admin user:   ${admin.email} (${admin.role})`);
  console.log(`  Houses:       ${oak.name}, ${river.name}`);
  console.log(`  Beds:         ${bedCount}`);
  console.log(`  Resident:     ${jane.firstName} ${jane.lastName} (${jane.id})`);
  console.log(`  Work orders:  ${workOrderCount} at ${oak.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
