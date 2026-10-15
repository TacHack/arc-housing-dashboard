"use client";

import { useRouter } from "next/navigation";
import { inputCls } from "@/components/ui";

export function HousePicker({
  houses,
  value,
  basePath = "/daily-ops",
}: {
  houses: { id: string; name: string }[];
  value: string;
  /** Path to navigate when house changes (query `?house=` appended). */
  basePath?: string;
}) {
  const router = useRouter();
  return (
    <label className="block text-sm font-medium text-slate-700 max-w-sm">
      House
      <select
        className={inputCls}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          router.push(v ? `${basePath}?house=${v}` : basePath);
        }}
      >
        <option value="">Select a house…</option>
        {houses.map((h) => (
          <option key={h.id} value={h.id}>
            {h.name}
          </option>
        ))}
      </select>
    </label>
  );
}
