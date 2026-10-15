import { PrismaClient, BedStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Summit Recovery Homes",
    },
  });

  const admin = await prisma.user.upsert({
    where: {
      orgId_email: { orgId: org.id, email: "admin@example.com" },
    },
    update: {
      name: "Admin",
      role: UserRole.admin,
    },
    create: {
      orgId: org.id,
      email: "admin@example.com",
      name: "Admin",
      role: UserRole.admin,
    },
  });

  const oak = await prisma.house.upsert({
    where: { id: "00000000-0000-4000-8000-000000000010" },
    update: { name: "Oak Street House" },
    create: {
      id: "00000000-0000-4000-8000-000000000010",
      orgId: org.id,
      name: "Oak Street House",
      address: "142 Oak Street",
      city: "Phoenix",
      state: "AZ",
      zip: "85004",
    },
  });

  const river = await prisma.house.upsert({
    where: { id: "00000000-0000-4000-8000-000000000011" },
    update: { name: "River Bend House" },
    create: {
      id: "00000000-0000-4000-8000-000000000011",
      orgId: org.id,
      name: "River Bend House",
      address: "88 River Bend Rd",
      city: "Tempe",
      state: "AZ",
      zip: "85281",
    },
  });

  const oakBeds = ["1A", "1B", "2A", "2B"];
  for (const label of oakBeds) {
    await prisma.bed.upsert({
      where: { houseId_label: { houseId: oak.id, label } },
      update: {},
      create: {
        orgId: org.id,
        houseId: oak.id,
        label,
        status: label === "1A" ? BedStatus.occupied : BedStatus.open,
      },
    });
  }

  const riverBeds = ["A1", "A2", "B1"];
  for (const label of riverBeds) {
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

  if ((await prisma.workOrder.count({ where: { houseId: oak.id } })) === 0) {
    await prisma.workOrder.createMany({
      data: [
        { orgId: org.id, houseId: oak.id, title: "Leaky kitchen faucet", description: "Drips constantly; washer likely worn.", room: "Kitchen", category: "maintenance", priority: "normal", status: "open", assigneeName: "Mike (handyman)", dueAt: new Date(Date.now() + 3 * 864e5) },
        { orgId: org.id, houseId: oak.id, title: "Replace smoke detector battery", room: "Hallway 2F", category: "safety", priority: "high", status: "in_progress", assigneeName: "House manager", dueAt: new Date(Date.now() + 864e5) },
      ],
    });
  }

  console.log("Seed complete:");
  console.log(`  Organization: ${org.name} (${org.id})`);
  console.log(`  Admin user:   ${admin.email} (${admin.role})`);
  console.log(`  Houses:       ${oak.name}, ${river.name}`);
  console.log(`  Beds:         ${oakBeds.length} at Oak, ${riverBeds.length} at River Bend`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
