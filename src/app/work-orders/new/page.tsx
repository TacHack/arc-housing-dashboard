import { AppShell } from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId } from "@/lib/org";
import { WorkOrderForm } from "../WorkOrderForm";
import { createWorkOrder } from "../actions";

export const instant = false;

export default async function NewWorkOrderPage({ searchParams }: { searchParams: Promise<{ house?: string }> }) {
  const { house } = await searchParams;
  const orgId = await getCurrentOrgId();
  const houses = await prisma.house.findMany({ where: { orgId }, orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <AppShell active="/work-orders">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">New work order</h1>
        <WorkOrderForm action={createWorkOrder} houses={houses} houseId={house} submit="Create work order" />
      </div>
    </AppShell>
  );
}
