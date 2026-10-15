import type { ResidentMed } from "@prisma/client";
import { Field, Section, btnCls, dangerBtnCls } from "@/components/ui";
import { createResidentMed, setResidentMedActive } from "../actions";

export function MedsTab({ residentId, meds }: { residentId: string; meds: ResidentMed[] }) {
  return (
    <div className="space-y-6">
      <form action={createResidentMed.bind(null, residentId)} className="space-y-4">
        <Section title="Add medication">
          <div className="sm:col-span-2">
            <Field label="Description (medication name)" name="description" required />
          </div>
          <Field label="Dosage" name="dosage" />
          <Field label="Amount" name="amount" />
        </Section>
        <button className={btnCls}>Add med</button>
      </form>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="px-5 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Medications</h2>
        {meds.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No medications recorded.</p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="px-5 py-2">Description</th><th className="px-5 py-2">Dosage</th><th className="px-5 py-2">Amount</th><th className="px-5 py-2">Status</th><th className="px-5 py-2" /></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meds.map((m) => (
                <tr key={m.id} className={m.active ? "" : "text-slate-400"}>
                  <td className="px-5 py-2 font-medium">{m.description}</td>
                  <td className="px-5 py-2">{m.dosage ?? "—"}</td>
                  <td className="px-5 py-2">{m.amount ?? "—"}</td>
                  <td className="px-5 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${m.active ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}>{m.active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-5 py-2 text-right">
                    <form action={setResidentMedActive.bind(null, residentId, m.id, !m.active)}>
                      <button className={m.active ? dangerBtnCls : "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"}>
                        {m.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
