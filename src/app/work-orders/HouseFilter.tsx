"use client";
import { useRouter } from "next/navigation";
import { inputCls } from "@/components/ui";

export function HouseFilter({ houses, value, status }: { houses: { id: string; name: string }[]; value: string; status: string }) {
  const router = useRouter();
  const go = (house: string, st: string) => {
    const q = new URLSearchParams();
    if (house) q.set("house", house);
    if (st) q.set("status", st);
    router.push(`/work-orders${q.size ? `?${q}` : ""}`);
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm font-medium text-slate-700">House</label>
      <select value={value} onChange={(e) => go(e.target.value, status)} className={`${inputCls} mt-0 w-auto`}>
        <option value="">All houses</option>
        {houses.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
      </select>
      <label className="text-sm font-medium text-slate-700">Status</label>
      <select value={status} onChange={(e) => go(value, e.target.value)} className={`${inputCls} mt-0 w-auto`}>
        <option value="">Active (not done)</option>
        <option value="all">All</option>
        <option value="open">Open</option><option value="in_progress">In progress</option>
        <option value="blocked">Blocked</option><option value="done">Done</option><option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
