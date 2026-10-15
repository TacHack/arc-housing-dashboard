import Link from "next/link";
import type { WorkOrder } from "@prisma/client";
import { btnCls } from "@/components/ui";
import { ymd } from "@/lib/org";
import { label, priorityCls, statusCls } from "@/app/work-orders/meta";

type Row = Pick<
  WorkOrder,
  "id" | "number" | "title" | "room" | "priority" | "status" | "assigneeName" | "dueAt" | "updatedAt"
>;

export function WorkOrdersTab({ houseId, workOrders }: { houseId: string; workOrders: Row[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Work orders</h2>
        <Link href={`/work-orders/new?house=${houseId}`} className={btnCls}>
          New work order
        </Link>
      </div>
      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {workOrders.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No work orders for this house.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                {["#", "Room", "Title", "Priority", "Status", "Assignee", "Due"].map((h) => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workOrders.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">#{w.number}</td>
                  <td className="px-4 py-3">{w.room ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/work-orders/${w.id}`} className="text-teal-700 hover:underline">
                      {w.title}
                    </Link>
                  </td>
                  <td className={`px-4 py-3 ${priorityCls[w.priority]}`}>{label(w.priority)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusCls[w.status]}`}>
                      {label(w.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{w.assigneeName ?? "—"}</td>
                  <td className="px-4 py-3">{ymd(w.dueAt) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
