import type { BehavioralContract } from "@prisma/client";
import { Field, Section, btnCls, inputCls } from "@/components/ui";
import { createBehavioralContract } from "../actions";

const statusLabel: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  void: "Void",
};

const statusBadge: Record<string, string> = {
  active: "bg-teal-50 text-teal-700",
  completed: "bg-slate-100 text-slate-600",
  void: "bg-red-50 text-red-700",
};

function fmtDate(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString("en-US", {
    timeZone: "America/Phoenix",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

export function ContractsTab({
  residentId,
  contracts,
}: {
  residentId: string;
  contracts: BehavioralContract[];
}) {
  return (
    <div className="space-y-6">
      <form
        action={createBehavioralContract.bind(null, residentId)}
        encType="multipart/form-data"
        className="space-y-4"
      >
        <Section title="Add behavioral contract">
          <div className="sm:col-span-2">
            <Field label="Title" name="title" required />
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Status
            <select name="status" defaultValue="active" className={inputCls}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="void">Void</option>
            </select>
          </label>
          <Field label="Signed date" name="signedAt" type="date" />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Notes
              <textarea
                name="notes"
                rows={3}
                placeholder="Terms, conditions, or staff notes…"
                className={inputCls}
              />
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Scan / PDF
              <input
                name="file"
                type="file"
                accept="application/pdf,image/*,.pdf,.jpg,.jpeg,.png,.gif,.webp,.heic"
                className={`${inputCls} file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-teal-800`}
              />
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Accepts PDF or image scans. Files are stored under uploads/contracts.
            </p>
          </div>
        </Section>
        <button className={btnCls} type="submit">
          Save contract
        </button>
      </form>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="px-5 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Behavioral contracts
        </h2>
        {contracts.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No behavioral contracts yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {contracts.map((c) => (
              <li key={c.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{c.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span
                        className={`rounded-full px-2 py-0.5 font-medium ${statusBadge[c.status] ?? "bg-slate-100"}`}
                      >
                        {statusLabel[c.status] ?? c.status}
                      </span>
                      <span>Added {fmtWhen(c.createdAt)} PT</span>
                      {c.signedAt && <span>· Signed {fmtDate(c.signedAt)}</span>}
                    </div>
                    {c.notes && (
                      <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{c.notes}</p>
                    )}
                  </div>
                  {(c.fileUrl || c.filePath) && (
                    <a
                      href={c.fileUrl || `/api/contracts/${c.id}/file`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50"
                    >
                      {c.fileName ? `Open ${c.fileName}` : "Open / download"}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
