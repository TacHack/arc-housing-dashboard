import type { WorkOrder } from "@prisma/client";
import { Field, Section, btnCls, inputCls } from "@/components/ui";
import { ymd } from "@/lib/org";
import { CATEGORIES, PRIORITIES, STATUSES, label } from "./meta";

function Select({ name, labelText, options, value, required }: { name: string; labelText: string; options: { v: string; l: string }[]; value?: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {labelText}
      <select name={name} required={required} defaultValue={value ?? ""} className={inputCls}>
        {required && !value && <option value="" disabled>Select…</option>}
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}
const opts = (a: readonly string[]) => a.map((v) => ({ v, l: label(v) }));

export function WorkOrderForm({ action, w, houses, houseId, submit }: {
  action: (f: FormData) => Promise<void>; w?: WorkOrder; houses: { id: string; name: string }[]; houseId?: string; submit: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <Section title="Location">
        <Select name="houseId" labelText="House" required value={w?.houseId ?? houseId} options={houses.map((h) => ({ v: h.id, l: h.name }))} />
        <Field label="Room" name="room" defaultValue={w?.room} />
      </Section>
      <Section title="Ticket">
        <div className="sm:col-span-2"><Field label="Title" name="title" required defaultValue={w?.title} /></div>
        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Description
          <textarea name="description" rows={3} defaultValue={w?.description ?? ""} className={inputCls} />
        </label>
        <Select name="category" labelText="Category" value={w?.category ?? "maintenance"} options={opts(CATEGORIES)} />
        <Select name="priority" labelText="Priority" value={w?.priority ?? "normal"} options={opts(PRIORITIES)} />
        <Select name="status" labelText="Status" value={w?.status ?? "open"} options={opts(STATUSES)} />
        <Field label="Assignee" name="assigneeName" defaultValue={w?.assigneeName} />
        <Field label="Due" name="dueAt" type="date" defaultValue={ymd(w?.dueAt)} />
      </Section>
      <button className={btnCls}>{submit}</button>
    </form>
  );
}
