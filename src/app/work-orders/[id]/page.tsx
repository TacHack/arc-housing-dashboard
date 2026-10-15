import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { btnCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId } from "@/lib/org";
import { WorkOrderForm } from "../WorkOrderForm";
import { setWorkOrderStatus, updateWorkOrder } from "../actions";
import { label, statusCls } from "../meta";

export const instant = false;

const ghostCls = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";

export default async function WorkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orgId = await getCurrentOrgId();
  const w = await prisma.workOrder.findFirst({
    where: { id, orgId },
    include: { house: { select: { name: true } }, events: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!w) notFound();
  const houses = await prisma.house.findMany({ where: { orgId }, orderBy: { name: "asc" }, select: { id: true, name: true } });
  const quick = (["in_progress", "blocked", "done", "cancelled"] as const).filter((s) => s !== w.status);
  const reopen = w.status === "done" || w.status === "cancelled";
  return (
    <AppShell active="/work-orders">
      <div className="max-w-3xl space-y-6">
        <Link href={`/work-orders?house=${w.houseId}`} className="text-sm font-medium text-teal-700 hover:text-teal-800">← {w.house.name} work orders</Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Work order #{w.number}</p>
            <h1 className="text-2xl font-semibold tracking-tight">{w.title}</h1>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm ${statusCls[w.status]}`}>{label(w.status)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {reopen ? (
            <form action={setWorkOrderStatus.bind(null, id, "open")}><button className={btnCls}>Reopen</button></form>
          ) : quick.map((s) => (
            <form key={s} action={setWorkOrderStatus.bind(null, id, s)}>
              <button className={s === "done" ? btnCls : ghostCls}>{s === "done" ? "Mark done" : label(s)}</button>
            </form>
          ))}
        </div>
        <WorkOrderForm action={updateWorkOrder.bind(null, id)} w={w} houses={houses} submit="Save changes" />
        {w.events.length > 0 && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Activity</h2>
            <ul className="space-y-1 text-sm text-slate-600">
              {w.events.map((e) => <li key={e.id}><span className="text-slate-400">{e.createdAt.toISOString().slice(0, 16).replace("T", " ")}Z</span> · {e.message}</li>)}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}
