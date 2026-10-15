import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { btnCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId, ymd } from "@/lib/org";
import { startNightCheck } from "./actions";
import { HousePicker } from "./HousePicker";

export const instant = false;

export default async function DailyOpsPage({
  searchParams,
}: {
  searchParams: Promise<{ house?: string }>;
}) {
  const { house = "" } = await searchParams;
  const orgId = await getCurrentOrgId();
  const houses = await prisma.house.findMany({
    where: { orgId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const houseId = houses.some((h) => h.id === house) ? house : "";

  const activeCount = houseId
    ? await prisma.resident.count({
        where: { orgId, houseId, status: "active" },
      })
    : 0;

  const inProgress = houseId
    ? await prisma.nightCheck.findFirst({
        where: { orgId, houseId, status: "in_progress" },
        orderBy: { startedAt: "desc" },
        include: {
          house: { select: { name: true } },
          _count: { select: { entries: true } },
        },
      })
    : null;

  const recent = await prisma.nightCheck.findMany({
    where: {
      orgId,
      ...(houseId ? { houseId } : {}),
      status: "completed",
    },
    orderBy: { completedAt: "desc" },
    take: 10,
    include: {
      house: { select: { name: true } },
      _count: { select: { entries: true } },
    },
  });

  return (
    <AppShell active="/daily-ops">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Daily ops</h1>
          <p className="mt-1 text-sm text-slate-500">
            Night check and UA logging — pick a house, run the roster, or log urinalysis results.
          </p>
          <p className="mt-2">
            <Link
              href={houseId ? `/daily-ops/ua?house=${houseId}` : "/daily-ops/ua"}
              className="text-sm font-medium text-teal-700 hover:underline"
            >
              UA logging →
            </Link>
          </p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Start night check
          </h2>
          <HousePicker houses={houses} value={houseId} />

          {houseId && (
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-900">{activeCount}</span> active resident
                {activeCount === 1 ? "" : "s"} on roster
              </p>
              {inProgress ? (
                <Link href={`/daily-ops/${inProgress.id}`} className={btnCls}>
                  Resume in-progress check
                </Link>
              ) : (
                <form action={startNightCheck}>
                  <input type="hidden" name="houseId" value={houseId} />
                  <button className={btnCls} type="submit">
                    Start night check
                  </button>
                </form>
              )}
            </div>
          )}
          {!houseId && houses.length === 0 && (
            <p className="text-sm text-slate-500">
              No houses yet.{" "}
              <Link href="/houses/new" className="text-teal-700 hover:underline">
                Add a house
              </Link>{" "}
              first.
            </p>
          )}
        </section>

        {houseId && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">UA results</h2>
              <p className="mt-1 text-sm text-slate-600">Log and review urinalysis for this house.</p>
            </div>
            <Link href={`/daily-ops/ua?house=${houseId}`} className={btnCls}>
              Open UA logging
            </Link>
          </section>
        )}

        {inProgress && (
          <section className="rounded-xl border border-teal-200 bg-teal-50/50 p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              In progress
            </h2>
            <p className="mt-2 text-sm">
              <Link
                href={`/daily-ops/${inProgress.id}`}
                className="font-medium text-teal-800 hover:underline"
              >
                {inProgress.house.name}
              </Link>
              <span className="text-slate-500">
                {" "}
                · started {ymd(inProgress.startedAt)} · {inProgress._count.entries} on roster
              </span>
            </p>
          </section>
        )}

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <h2 className="px-5 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Recent completed checks
          </h2>
          <table className="mt-3 w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-2">House</th>
                <th className="px-5 py-2">Completed</th>
                <th className="px-5 py-2">Roster</th>
                <th className="px-5 py-2">Handoff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-slate-500">
                    No completed night checks yet.
                  </td>
                </tr>
              )}
              {recent.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium">
                    <Link href={`/daily-ops/${c.id}`} className="text-teal-700 hover:underline">
                      {c.house.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{ymd(c.completedAt) || "—"}</td>
                  <td className="px-5 py-3">{c._count.entries}</td>
                  <td className="px-5 py-3 text-slate-500 max-w-xs truncate">
                    {c.handoffNote || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}
