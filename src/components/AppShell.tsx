import Link from "next/link";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/houses", label: "Houses" },
  { href: "/residents", label: "Residents" },
  { href: "/daily-ops", label: "Daily ops" },
];

export function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      <aside className="w-56 shrink-0 bg-slate-900 text-slate-300 flex flex-col">
        <div className="px-4 pt-5 pb-4">
          <p className="text-xs uppercase tracking-wider text-teal-400 font-semibold">
            ARC Housing Dashboard
          </p>
          <p className="text-sm text-slate-400 mt-1">Operations console</p>
        </div>
        <nav className="px-2 flex-1 space-y-0.5">
          {nav.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-teal-700 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 text-xs text-slate-500 border-t border-slate-800">
          HTML mock:{" "}
          <code className="text-slate-400">/workspace/sober-crm-mocks/</code>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">Summit Recovery Homes</span>
          <span className="text-xs rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
            Sprint 1 scaffold
          </span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
