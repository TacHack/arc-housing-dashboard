import Link from "next/link";
import type { Prisma, WorkOrderStatus } from "@prisma/client";
import { AppShell } from "@/components/AppShell";
import { btnCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId, ymd } from "@/lib/org";
import { HouseFilter } from "./HouseFilter";
import { STATUSES, label, priorityCls, statusCls } from "./meta";

// DB-backed, per-request page.
export const instant = false;

export default async function WorkOrdersPage({ searchParams }: { searchParams: Promise<{ house?: string; status?: string }> }) {
  const { house = "", status = "" } = await searchParams;
  const orgId = await getCurrentOrgId();
  const houses = await prisma.house.findMany({ where: { orgId }, orderBy: { name: "asc" }, select: { id: true, name: true } });
  const houseId = houses.some((h) => h.id === house) ? house : "";
  const where: Prisma.WorkOrderWhereInput = { orgId };
  if (houseId) where.houseId = houseId;
  if (status === "") where.status = { notIn: ["done", "cancelled"] };
  else if ((STATUSES as readonly string[]).includes(status)) where.status = status as WorkOrderStatus;
  const rows = await prisma.workOrder.findMany({
    where, orderBy: [{ updatedAt: "desc" }], include: { house: { select: { name: true } } },
  });
  return (
    <AppShell active="/work-orders">
      <div className="max-w-6xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Work orders</h1>
          <Link href={`/work-orders/new${houseId ? `?house=${houseId}` : ""}`} className={btnCls}>New work order</Link>
        </div>
        <HouseFilter houses={houses} value={houseId} status={status} />
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>{["#", "House / room", "Title", "Priority", "Status", "Assignee", "Due", "Updated"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-slate-500">No work orders.</td></tr>}
              {rows.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">#{w.number}</td>
                  <td className="px-4 py-3">{w.house.name}{w.room && <span className="text-slate-500"> · {w.room}</span>}</td>
                  <td className="px-4 py-3 font-medium"><Link href={`/work-orders/${w.id}`} className="text-teal-700 hover:underline">{w.title}</Link></td>
                  <td className={`px-4 py-3 ${priorityCls[w.priority]}`}>{label(w.priority)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${statusCls[w.status]}`}>{label(w.status)}</span></td>
                  <td className="px-4 py-3">{w.assigneeName ?? "—"}</td>
                  <td className="px-4 py-3">{ymd(w.dueAt) || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{ymd(w.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
