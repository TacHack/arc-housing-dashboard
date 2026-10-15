export const CATEGORIES = ["maintenance", "cleaning", "safety", "supplies", "other"] as const;
export const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export const STATUSES = ["open", "in_progress", "blocked", "done", "cancelled"] as const;
export const label = (s: string) => s.replace("_", " ").replace(/^./, (c) => c.toUpperCase());
export const statusCls: Record<string, string> = {
  open: "bg-sky-50 text-sky-700", in_progress: "bg-teal-50 text-teal-700", blocked: "bg-amber-50 text-amber-700",
  done: "bg-slate-100 text-slate-600", cancelled: "bg-slate-100 text-slate-400 line-through",
};
export const priorityCls: Record<string, string> = {
  low: "text-slate-500", normal: "text-slate-700", high: "text-amber-700 font-medium", urgent: "text-red-700 font-semibold",
};
