import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { dangerBtnCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId } from "@/lib/org";
import { HouseForm } from "../HouseForm";
import { deleteHouse, updateHouse } from "../actions";
import { WorkOrdersTab } from "./WorkOrdersTab";

// DB-backed, per-request page.
export const instant = false;

const tabCls = (on: boolean) =>
  `border-b-2 px-1 pb-2 text-sm font-medium ${on ? "border-teal-700 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-700"}`;

export default async function HousePage({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const { tab } = await searchParams;
  const orgId = await getCurrentOrgId();
  const house = await prisma.house.findFirst({ where: { id, orgId } });
  if (!house) notFound();
  const isWorkOrders = tab === "work-orders";
  const workOrders = isWorkOrders
    ? await prisma.workOrder.findMany({
        where: { orgId, houseId: id },
        orderBy: [{ updatedAt: "desc" }],
        select: {
          id: true, number: true, title: true, room: true, priority: true,
          status: true, assigneeName: true, dueAt: true, updatedAt: true,
        },
      })
    : [];
  const onDetails = !isWorkOrders;
  return (
    <AppShell active="/houses">
      <div className={`space-y-6 ${isWorkOrders ? "max-w-6xl" : "max-w-3xl"}`}>
        <h1 className="text-2xl font-semibold tracking-tight">{house.name}</h1>
        <nav className="flex flex-wrap gap-6 border-b border-slate-200">
          <Link href={`/houses/${id}`} className={tabCls(onDetails)}>House details</Link>
          <Link href={`/houses/${id}?tab=work-orders`} className={tabCls(isWorkOrders)}>Work orders</Link>
        </nav>
        {isWorkOrders ? (
          <WorkOrdersTab houseId={id} workOrders={workOrders} />
        ) : (
          <>
            <HouseForm action={updateHouse.bind(null, id)} house={house} submit="Save changes" />
            <form action={deleteHouse.bind(null, id)}>
              <button className={dangerBtnCls}>Delete house</button>
            </form>
          </>
        )}
      </div>
    </AppShell>
  );
}
