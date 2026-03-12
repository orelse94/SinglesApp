import { signOutAction } from "../../(auth)/actions";
import { requireAdmin } from "@/lib/auth/guards";
import { getAdminSidebarCounts } from "./lib";
import { AdminSidebarNav } from "./sidebar-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const counts = await getAdminSidebarCounts();

  const adminNavigation = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users", badge: counts.memberUserCount },
    { href: "/admin/operators", label: "Admin Users", badge: counts.adminUserCount },
    { href: "/admin/verifications", label: "Verifications", badge: counts.pendingVerificationCount },
    { href: "/admin/reports", label: "Reports", badge: counts.openReportCount },
    { href: "/admin/events", label: "Events", badge: counts.activeEventCount },
    { href: "/admin/audit-logs", label: "Audit Logs", badge: counts.auditLogCount },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-slate-800 bg-slate-900/90 px-5 py-6 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Discreet Community</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Admin</h1>
              <p className="mt-2 text-sm text-slate-400">Separate shell for moderation, verification review, and operations.</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Signed in as</p>
              <p className="mt-2 text-sm font-medium text-white">{admin.email}</p>
            </div>

            <AdminSidebarNav items={adminNavigation} />

            <form action={signOutAction}>
              <button className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="flex-1 px-4 py-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
