import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { btnCls, inputCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId, ymd } from "@/lib/org";
import { completeNightCheck, setEntryStatus } from "../actions";
import {
  ENTRY_STATUSES,
  entryActiveCls,
  entryBadgeCls,
  entryBtnCls,
  entryLabel,
} from "../meta";

export const instant = false;

export default async function NightCheckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orgId = await getCurrentOrgId();
  const check = await prisma.nightCheck.findFirst({
    where: { id, orgId },
    include: {
      house: { select: { id: true, name: true } },
      shiftSession: { select: { id: true, status: true, startedAt: true, endedAt: true } },
      entries: {
        include: {
          resident: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              bed: { select: { label: true } },
            },
          },
        },
        orderBy: [
          { resident: { lastName: "asc" } },
          { resident: { firstName: "asc" } },
        ],
      },
    },
  });
  if (!check) notFound();

  const open = check.status === "in_progress";
  const counts = ENTRY_STATUSES.reduce(
    (acc, s) => {
      acc[s] = check.entries.filter((e) => e.status === s).length;
      return acc;
    },
    { pending: check.entries.filter((e) => e.status === "pending").length } as Record<
      string,
      number
    >
  );

  return (
    <AppShell active="/daily-ops">
      <div className="max-w-4xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              <Link href={`/daily-ops?house=${check.house.id}`} className="text-teal-700 hover:underline">
                Daily ops
              </Link>
              <span className="mx-1.5">/</span>
              Night check
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{check.house.name}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Session {check.shiftSession.status} · started {ymd(check.startedAt)}
              {check.completedAt ? ` · completed ${ymd(check.completedAt)}` : ""}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              open ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            {open ? "In progress" : "Completed"}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          {(
            [
              ["pending", "Pending"],
              ...ENTRY_STATUSES.map((s) => [s, entryLabel[s]] as const),
            ] as const
          ).map(([key, label]) => (
            <div
              key={key}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
            >
              <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
              <p className="font-semibold text-slate-900">{counts[key] ?? 0}</p>
            </div>
          ))}
        </div>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <h2 className="px-5 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Roster
          </h2>
          {check.entries.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">
              No active residents at this house when the check started.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {check.entries.map((entry) => {
                const name = `${entry.resident.firstName} ${entry.resident.lastName}`;
                return (
                  <li key={entry.id} className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">
                        <Link
                          href={`/residents/${entry.resident.id}`}
                          className="text-teal-700 hover:underline"
                        >
                          {name}
                        </Link>
                        {entry.resident.bed && (
                          <span className="ml-2 text-sm font-normal text-slate-500">
                            Bed {entry.resident.bed.label}
                          </span>
                        )}
                      </p>
                      <p className="mt-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${entryBadgeCls[entry.status]}`}
                        >
                          {entryLabel[entry.status]}
                        </span>
                      </p>
                    </div>
                    {open && (
                      <div className="flex flex-wrap gap-1.5">
                        {ENTRY_STATUSES.map((status) => (
                          <form
                            key={status}
                            action={setEntryStatus.bind(null, check.id, entry.id)}
                          >
                            <input type="hidden" name="status" value={status} />
                            <button
                              type="submit"
                              className={
                                entry.status === status
                                  ? entryActiveCls[status]
                                  : entryBtnCls[status]
                              }
                            >
                              {entryLabel[status]}
                            </button>
                          </form>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {open ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Complete night check
            </h2>
            {(counts.pending ?? 0) > 0 && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {counts.pending} resident{counts.pending === 1 ? "" : "s"} still pending — you can
                still complete and note them in the handoff.
              </p>
            )}
            <form action={completeNightCheck.bind(null, check.id)} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Handoff note
                <textarea
                  name="handoffNote"
                  rows={3}
                  placeholder="Anything the next shift should know…"
                  className={inputCls}
                />
              </label>
              <button type="submit" className={btnCls}>
                Complete night check
              </button>
            </form>
          </section>
        ) : (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Handoff note
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {check.handoffNote || "No handoff note recorded."}
            </p>
            <Link
              href={`/daily-ops?house=${check.house.id}`}
              className="inline-block mt-3 text-sm font-medium text-teal-700 hover:underline"
            >
              ← Back to daily ops
            </Link>
          </section>
        )}
      </div>
    </AppShell>
  );
}
