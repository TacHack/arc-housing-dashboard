import type { ClientLog } from "@prisma/client";
import { Section, btnCls, inputCls } from "@/components/ui";
import { createClientLog } from "../actions";

const typeLabel: Record<string, string> = {
  progress: "Progress",
  behavior: "Behavior",
  shift: "Shift report",
};

const typeBadge: Record<string, string> = {
  progress: "bg-teal-50 text-teal-700",
  behavior: "bg-amber-50 text-amber-800",
  shift: "bg-sky-50 text-sky-700",
};

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

export function NotesTab({ residentId, logs }: { residentId: string; logs: ClientLog[] }) {
  return (
    <div className="space-y-6">
      <form action={createClientLog.bind(null, residentId)} className="space-y-4">
        <Section title="Add note">
          <label className="block text-sm font-medium text-slate-700">
            Type
            <select name="type" required defaultValue="progress" className={inputCls}>
              <option value="progress">Progress</option>
              <option value="behavior">Behavior</option>
              <option value="shift">Shift report</option>
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
                name="body"
                required
                rows={4}
                placeholder="Progress notes, behavioral changes, or shift report…"
                className={inputCls}
              />
            </label>
          </div>
        </Section>
        <button className={btnCls} type="submit">
          Save note
        </button>
        <p className="text-xs text-slate-500">Notes are immutable after save.</p>
      </form>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="px-5 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Notes
        </h2>
        {logs.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No notes yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {logs.map((log) => (
              <li key={log.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${typeBadge[log.type] ?? "bg-slate-100"}`}>
                    {typeLabel[log.type] ?? log.type}
                  </span>
                  <span>{fmtWhen(log.createdAt)} PT</span>
                  {log.author && <span>· {log.author}</span>}
                </div>
                <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{log.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
