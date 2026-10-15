import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { btnCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId } from "@/lib/org";


// DB-backed, per-request page.
export const instant = false;

export default async function HousesPage() {
  const orgId = await getCurrentOrgId();
  const houses = await prisma.house.findMany({
    where: { orgId }, orderBy: { name: "asc" },
    include: { beds: { select: { status: true } } },
  });
  return (
    <AppShell active="/houses">
      <div className="max-w-4xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Houses</h1>
          <Link href="/houses/new" className={btnCls}>New house</Link>
        </div>
        {houses.length === 0 && <p className="text-sm text-slate-500">No houses yet.</p>}
        <ul className="grid gap-4 sm:grid-cols-2">
          {houses.map((house) => (
            <li key={house.id}>
              <Link href={`/houses/${house.id}`} className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-teal-600">
                <h2 className="font-semibold text-slate-900">{house.name}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {[house.address, house.city, house.state].filter(Boolean).join(", ")}
                </p>
                <div className="mt-4 flex gap-4 text-sm">
                  <div><p className="text-xs uppercase tracking-wide text-slate-400">Beds</p><p className="font-medium">{house.beds.length}</p></div>
                  <div><p className="text-xs uppercase tracking-wide text-slate-400">Open</p><p className="font-medium text-teal-700">{house.beds.filter((b) => b.status === "open").length}</p></div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
