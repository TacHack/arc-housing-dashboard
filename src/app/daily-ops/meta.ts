import type { NightCheckEntryStatus } from "@prisma/client";

export const ENTRY_STATUSES = [
  "present",
  "out_on_pass",
  "late",
  "missing",
  "skipped",
] as const satisfies readonly NightCheckEntryStatus[];

export type MarkableStatus = (typeof ENTRY_STATUSES)[number];

export const entryLabel: Record<NightCheckEntryStatus, string> = {
  pending: "Pending",
  present: "Present",
  out_on_pass: "Out on pass",
  late: "Late",
  missing: "Missing",
  skipped: "Skipped",
};

export const entryBtnCls: Record<MarkableStatus, string> = {
  present:
    "rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100",
  out_on_pass:
    "rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-800 hover:bg-sky-100",
  late:
    "rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100",
  missing:
    "rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100",
  skipped:
    "rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100",
};

export const entryBadgeCls: Record<NightCheckEntryStatus, string> = {
  pending: "bg-slate-100 text-slate-600",
  present: "bg-teal-50 text-teal-700",
  out_on_pass: "bg-sky-50 text-sky-700",
  late: "bg-amber-50 text-amber-800",
  missing: "bg-red-50 text-red-700",
  skipped: "bg-slate-100 text-slate-500",
};

export const entryActiveCls: Record<MarkableStatus, string> = {
  present: "ring-2 ring-teal-600 bg-teal-700 text-white border-teal-700 hover:bg-teal-800",
  out_on_pass: "ring-2 ring-sky-600 bg-sky-700 text-white border-sky-700 hover:bg-sky-800",
  late: "ring-2 ring-amber-600 bg-amber-600 text-white border-amber-600 hover:bg-amber-700",
  missing: "ring-2 ring-red-600 bg-red-700 text-white border-red-700 hover:bg-red-800",
  skipped: "ring-2 ring-slate-500 bg-slate-600 text-white border-slate-600 hover:bg-slate-700",
};
