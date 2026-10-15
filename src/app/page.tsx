import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function HomePage() {
  return (
    <AppShell active="/">
      <div className="max-w-3xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              ARC Housing Dashboard
            </h1>
            <p className="mt-2 text-slate-600 leading-relaxed">
              A Kipu-like console for multi-house sober living providers: manage
              organizations, houses, beds, residents, and house-scoped work
              orders with a full audit trail.
            </p>
          </div>
          <Link
            href="/houses/new"
            className="shrink-0 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-600"
          >
            Add house
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/houses"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-teal-300 hover:shadow transition-all"
          >
            <h2 className="font-semibold text-slate-900">Houses &amp; beds</h2>
            <p className="mt-1 text-sm text-slate-500">
              Inventory by house — open, occupied, reserved, offline.
            </p>
            <span className="mt-3 inline-block text-sm font-medium text-teal-700">
              Open houses →
            </span>
          </Link>
          <Link
            href="/houses/new"
            className="rounded-xl border border-teal-200 bg-teal-50/50 p-5 shadow-sm hover:border-teal-400 hover:shadow transition-all"
          >
            <h2 className="font-semibold text-slate-900">Add a house</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create another location — it shows up in daily ops and work orders.
            </p>
            <span className="mt-3 inline-block text-sm font-medium text-teal-700">
              New house →
            </span>
          </Link>
          <Link
            href="/daily-ops"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-teal-300 hover:shadow transition-all"
          >
            <h2 className="font-semibold text-slate-900">Daily ops</h2>
            <p className="mt-1 text-sm text-slate-500">
              Night check roster — present, out on pass, late, missing.
            </p>
            <span className="mt-3 inline-block text-sm font-medium text-teal-700">
              Open daily ops →
            </span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
