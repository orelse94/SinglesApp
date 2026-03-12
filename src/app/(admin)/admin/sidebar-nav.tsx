"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavItem = {
  href: string;
  label: string;
  badge?: number;
};

function navTestId(label: string) {
  return `admin-sidebar-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function AdminSidebarNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname() ?? "";

  return (
    <nav className="grid gap-2" data-testid="admin-sidebar-nav">
      {items.map((item) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
              isActive
                ? "border-slate-200 bg-slate-100 text-slate-950 shadow-sm"
                : "border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/60"
            }`}
            data-testid={navTestId(item.label)}
            href={item.href}
          >
            <span className="font-medium">{item.label}</span>
            {typeof item.badge === "number" ? (
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  isActive ? "bg-slate-950 text-slate-100" : "bg-slate-800 text-slate-200"
                }`}
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
