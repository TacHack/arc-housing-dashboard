import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { btnCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId, ymd } from "@/lib/org";


// DB-backed, per-request page.
export const instant = false;

export default async function ResidentsPage() {
  const orgId = await getCurrentOrgId();
  const residents = await prisma.resident.findMany({
    where: { orgId }, orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { house: { select: { name: true } } },
  });
  return (
    <AppShell active="/residents">
      <div className="max-w-5xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Residents</h1>
          <Link href="/residents/new" className={btnCls}>New resident</Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">DOB</th><th className="px-4 py-3">Admitted</th><th className="px-4 py-3">Insurance</th><th className="px-4 py-3">House</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {residents.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-slate-500">No residents yet.</td></tr>}
              {residents.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium"><Link href={`/residents/${r.id}`} className="text-teal-700 hover:underline">{r.firstName} {r.lastName}</Link></td>
                  <td className="px-4 py-3">{ymd(r.dob) || "—"}</td>
                  <td className="px-4 py-3">{ymd(r.admissionDate) || "—"}</td>
                  <td className="px-4 py-3">{r.insuranceCarrier ?? "—"}</td>
                  <td className="px-4 py-3">{r.house?.name ?? "—"}</td>
                  <td className="px-4 py-3 capitalize">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
