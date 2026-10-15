import {
  BedStatus,
  PrismaClient,
  ResidentStatus,
  UserRole,
} from "@prisma/client";

const ORG_ID = "00000000-0000-4000-8000-000000000001";
const OAK_ID = "00000000-0000-4000-8000-000000000010";
const RIVER_ID = "00000000-0000-4000-8000-000000000011";

const JANE_MEDS = [
  { description: "Naltrexone", dosage: "50 mg", amount: "1 tablet daily" },
  { description: "Sertraline", dosage: "25 mg", amount: "1 tablet morning" },
] as const;

const SAMPLE_WORK_ORDERS = [
  {
    title: "Leaky kitchen faucet",
    description: "Drips constantly; washer likely worn.",
    room: "Kitchen",
    category: "maintenance" as const,
    priority: "normal" as const,
    status: "open" as const,
    assigneeName: "Mike (handyman)",
    dueInDays: 3,
  },
  {
    title: "Replace smoke detector battery",
    description: null,
    room: "Hallway 2F",
    category: "safety" as const,
    priority: "high" as const,
    status: "in_progress" as const,
    assigneeName: "House manager",
    dueInDays: 1,
  },
];

export async function seedSampleData(prisma: PrismaClient) {
  const org = await prisma.organization.upsert({
    where: { id: ORG_ID },
    update: { name: "Summit Recovery Homes" },
    create: { id: ORG_ID, name: "Summit Recovery Homes" },
  });

  const admin = await prisma.user.upsert({
    where: { orgId_email: { orgId: org.id, email: "admin@example.com" } },
    update: { name: "Admin", role: UserRole.admin },
    create: {
      orgId: org.id,
      email: "admin@example.com",
      name: "Admin",
      role: UserRole.admin,
    },
  });

  const oak = await prisma.house.upsert({
    where: { id: OAK_ID },
    update: { name: "Oak Street House" },
    create: {
      id: OAK_ID,
      orgId: org.id,
      name: "Oak Street House",
      address: "142 Oak Street",
      city: "Phoenix",
      state: "AZ",
      zip: "85004",
    },
  });

  const river = await prisma.house.upsert({
    where: { id: RIVER_ID },
    update: { name: "River Bend House" },
    create: {
      id: RIVER_ID,
      orgId: org.id,
      name: "River Bend House",
      address: "88 River Bend Rd",
      city: "Tempe",
      state: "AZ",
      zip: "85281",
    },
  });

  for (const label of ["1A", "1B", "2A", "2B"]) {
    await prisma.bed.upsert({
      where: { houseId_label: { houseId: oak.id, label } },
      update: {},
      create: { orgId: org.id, houseId: oak.id, label, status: BedStatus.open },
    });
  }

  for (const label of ["A1", "A2", "B1"]) {
    await prisma.bed.upsert({
      where: { houseId_label: { houseId: river.id, label } },
      update: {},
      create: {
        orgId: org.id,
        houseId: river.id,
        label,
        status: BedStatus.open,
      },
    });
  }

  const jane = await ensureJaneDoe(prisma, org.id, oak.id);

  for (const order of SAMPLE_WORK_ORDERS) {
    const existing = await prisma.workOrder.findFirst({
      where: { houseId: oak.id, title: order.title },
      select: { id: true },
    });
    if (existing) continue;
    await prisma.workOrder.create({
      data: {
        orgId: org.id,
        houseId: oak.id,
        title: order.title,
        description: order.description,
        room: order.room,
        category: order.category,
        priority: order.priority,
        status: order.status,
        assigneeName: order.assigneeName,
        dueAt: new Date(Date.now() + order.dueInDays * 864e5),
      },
    });
  }

  return { org, admin, oak, river, jane };
}

async function ensureJaneDoe(prisma: PrismaClient, orgId: string, oakId: string) {
  const existing = await prisma.resident.findFirst({
    where: { orgId, firstName: "Jane", lastName: "Doe" },
    include: { meds: true, bed: true, house: true },
  });

  const bed1A = await prisma.bed.findFirst({
    where: { houseId: oakId, label: "1A" },
    include: { residents: { select: { id: true } } },
  });
  const bedIsFree =
    bed1A != null &&
    bed1A.residents.every((resident) => resident.id === existing?.id);

  if (!existing) {
    const jane = await prisma.resident.create({
      data: {
        orgId,
        houseId: oakId,
        bedId: bedIsFree ? bed1A.id : null,
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
          create: JANE_MEDS.map((med) => ({ orgId, ...med })),
        },
      },
      include: { meds: true, bed: true, house: true },
    });
    if (jane.bedId) {
      await prisma.bed.update({
        where: { id: jane.bedId },
        data: { status: BedStatus.occupied },
      });
    }
    return jane;
  }

  for (const med of JANE_MEDS) {
    const hasMed = existing.meds.some((row) => row.description === med.description);
    if (!hasMed) {
      await prisma.residentMed.create({
        data: { orgId, residentId: existing.id, ...med },
      });
    }
  }

  return prisma.resident.findFirstOrThrow({
    where: { id: existing.id },
    include: { meds: true, bed: true, house: true },
  });
}
