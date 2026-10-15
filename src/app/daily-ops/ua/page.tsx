import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Section, btnCls, inputCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId } from "@/lib/org";
import { createUaResult } from "../actions";
import { HousePicker } from "../HousePicker";
import { UA_OUTCOMES, uaOutcomeBadge, uaOutcomeLabel } from "../ua-meta";

export const instant = false;

function fmtWhen(d: Date) {
  return d.toLocaleString("en-US", {
    timeZone: "America/Phoenix",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function UaLoggingPage({
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

  const residents = houseId
    ? await prisma.resident.findMany({
        where: { orgId, houseId, status: "active" },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: { id: true, firstName: true, lastName: true },
      })
    : [];

  const openShift = houseId
    ? await prisma.shiftSession.findFirst({
        where: { orgId, houseId, status: "open" },
        orderBy: { startedAt: "desc" },
        select: { id: true, startedAt: true },
      })
    : null;

  const results = await prisma.uaResult.findMany({
    where: {
      orgId,
      ...(houseId ? { houseId } : {}),
    },
    orderBy: { testedAt: "desc" },
    take: 50,
    include: {
      resident: { select: { id: true, firstName: true, lastName: true } },
      house: { select: { name: true } },
    },
  });

  return (
    <AppShell active="/daily-ops">
      <div className="max-w-4xl space-y-6">
        <div>
          <p className="text-sm text-slate-500">
            <Link href={houseId ? `/daily-ops?house=${houseId}` : "/daily-ops"} className="text-teal-700 hover:underline">
              Daily ops
            </Link>
            <span className="mx-1.5">/</span>
            UA logging
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">UA results</h1>
          <p className="mt-1 text-sm text-slate-500">
            Log urinalysis outcomes (neg / pos / refused / unable). Notes only for positive or refused.
            {openShift && (
              <span className="block mt-1 text-teal-700">
                Open shift will be attached automatically when you log.
              </span>
            )}
          </p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            House
          </h2>
          <HousePicker houses={houses} value={houseId} basePath="/daily-ops/ua" />
          {!houseId && (
            <p className="text-sm text-slate-500">Select a house to log and filter results.</p>
          )}
        </section>

        {houseId && (
          <form action={createUaResult} className="space-y-4">
            <input type="hidden" name="houseId" value={houseId} />
            <Section title="Log UA result">
              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                Resident
                <select name="residentId" required className={inputCls} defaultValue="">
                  <option value="" disabled>
                    Select resident…
                  </option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.lastName}, {r.firstName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Outcome
                <select name="outcome" required defaultValue="neg" className={inputCls}>
                  {UA_OUTCOMES.map((o) => (
                    <option key={o} value={o}>
                      {uaOutcomeLabel[o]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Author
                <input name="author" defaultValue="Staff" className={inputCls} />
              </label>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Note
                  <textarea
                    name="note"
                    rows={3}
                    placeholder="Optional — saved only for positive or refused…"
                    className={inputCls}
                  />
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  MVP: notes are stored only when outcome is Positive or Refused.
                </p>
              </div>
            </Section>
            <button className={btnCls} type="submit" disabled={residents.length === 0}>
              Save UA result
            </button>
            {residents.length === 0 && (
              <p className="text-sm text-slate-500">No active residents at this house.</p>
            )}
          </form>
        )}

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <h2 className="px-5 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Recent results{houseId ? "" : " (all houses)"}
          </h2>
          {results.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No UA results logged yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {results.map((row) => {
                const name = `${row.resident.firstName} ${row.resident.lastName}`;
                return (
                  <li key={row.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span
                        className={`rounded-full px-2 py-0.5 font-medium ${uaOutcomeBadge[row.outcome]}`}
                      >
                        {uaOutcomeLabel[row.outcome]}
                      </span>
                      <span>{fmtWhen(row.testedAt)} PT</span>
                      {row.author && <span>· {row.author}</span>}
                      {row.house && <span>· {row.house.name}</span>}
                      {row.shiftSessionId && <span>· shift-linked</span>}
                    </div>
                    <p className="mt-1.5 font-medium text-slate-900">
                      <Link
                        href={`/residents/${row.resident.id}?tab=ua`}
                        className="text-teal-700 hover:underline"
                      >
                        {name}
                      </Link>
                    </p>
                    {row.note && (
                      <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{row.note}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
