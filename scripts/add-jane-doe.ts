import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { directDatabaseUrl } from "../prisma/db-url";
import { seedSampleData } from "../prisma/sample-data";

const prisma = new PrismaClient({ datasourceUrl: directDatabaseUrl() });

async function main() {
  const { jane } = await seedSampleData(prisma);
  const residentCount = await prisma.resident.count();
  const medCount = await prisma.residentMed.count();

  console.log(
    JSON.stringify(
      {
        residentId: jane.id,
        url: `/residents/${jane.id}?tab=meds`,
        house: jane.house?.name ?? null,
        bed: jane.bed?.label ?? null,
        meds: jane.meds.map((med) => ({
          id: med.id,
          description: med.description,
          dosage: med.dosage,
          amount: med.amount,
        })),
        counts: {
          residentsTotal: residentCount,
          medsTotal: medCount,
          janeMeds: jane.meds.length,
        },
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
