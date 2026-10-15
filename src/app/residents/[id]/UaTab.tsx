import type { House, UaResult } from "@prisma/client";
import { Section, btnCls, inputCls } from "@/components/ui";
import { UA_OUTCOMES, uaOutcomeBadge, uaOutcomeLabel } from "@/app/daily-ops/ua-meta";
import { createResidentUaResult } from "../actions";

type UaRow = UaResult & { house: Pick<House, "name"> | null };

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

export function UaTab({ residentId, results }: { residentId: string; results: UaRow[] }) {
  return (
    <div className="space-y-6">
      <form action={createResidentUaResult.bind(null, residentId)} className="space-y-4">
        <Section title="Log UA result">
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
              MVP: notes are stored only when outcome is Positive or Refused. House/open shift are
              attached automatically when available.
            </p>
          </div>
        </Section>
        <button className={btnCls} type="submit">
          Save UA result
        </button>
      </form>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="px-5 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          UA history
        </h2>
        {results.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No UA results yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {results.map((row) => (
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
                {row.note && (
                  <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{row.note}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
