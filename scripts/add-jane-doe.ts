import "dotenv/config";
import { PrismaClient, BedStatus, ResidentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const oak = await prisma.house.findFirst({
    where: { name: "Oak Street House" },
  });
  if (!oak) throw new Error("Oak Street House not found — run db:seed first");

  const openBed = await prisma.bed.findFirst({
    where: { houseId: oak.id, status: BedStatus.open },
    orderBy: { label: "asc" },
  });

  const resident = await prisma.resident.create({
    data: {
      orgId: oak.orgId,
      houseId: oak.id,
      bedId: openBed?.id ?? null,
      firstName: "Jane",
      lastName: "Doe",
      dob: new Date("1990-05-12T00:00:00.000Z"),
      admissionDate: new Date("2026-09-01T00:00:00.000Z"),
      insuranceCarrier: "Blue Cross",
      insuranceMemberId: "BC123456",
      emergencyContactName: "John Doe",
      emergencyContactPhone: "555-0100",
      status: ResidentStatus.active,
      moveInAt: new Date("2026-09-01T00:00:00.000Z"),
      meds: {
        create: [
          {
            orgId: oak.orgId,
            description: "Naltrexone",
            dosage: "50 mg",
            amount: "1 tablet daily",
          },
          {
            orgId: oak.orgId,
            description: "Sertraline",
            dosage: "25 mg",
            amount: "1 tablet morning",
          },
        ],
      },
    },
    include: { meds: true, bed: true, house: true },
  });

  if (openBed) {
    await prisma.bed.update({
      where: { id: openBed.id },
      data: { status: BedStatus.occupied },
    });
  }

  const residentCount = await prisma.resident.count();
  const medCount = await prisma.residentMed.count();
  const janeMedCount = await prisma.residentMed.count({
    where: { residentId: resident.id },
  });

  console.log(
    JSON.stringify(
      {
        residentId: resident.id,
        url: `/residents/${resident.id}?tab=meds`,
        house: resident.house?.name,
        bed: resident.bed?.label ?? null,
        bedWasOpen: !!openBed,
        meds: resident.meds.map((m) => ({
          id: m.id,
          description: m.description,
          dosage: m.dosage,
          amount: m.amount,
        })),
        counts: {
          residentsTotal: residentCount,
          medsTotal: medCount,
          janeMeds: janeMedCount,
        },
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
