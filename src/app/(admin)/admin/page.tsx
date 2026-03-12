import { AdminPageIntro, AdminQuickLink, SavedMessageBanner, getAdminDashboardData } from "./lib";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const dashboard = await getAdminDashboardData();

  return (
    <main className="space-y-6">
      <SavedMessageBanner saved={resolvedSearchParams?.saved} />
      <AdminPageIntro
        eyebrow="Dashboard"
        title="Admin dashboard"
        description="A focused admin shell for the highest-signal operational work. This landing screen stays lightweight and points into the dedicated admin tools."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.cards.map((card) => (
          <article key={card.label} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <AdminQuickLink href="/admin/users" label="Users" hint="Review member accounts, moderation state, and test-user labeling." />
        <AdminQuickLink href="/admin/operators" label="Admin Users" hint="Manage operational admin-only accounts separately from members." />
        <AdminQuickLink href="/admin/verifications" label="Verifications" hint="Review pending verification requests and approve or reject them." />
        <AdminQuickLink href="/admin/reports" label="Reports" hint="Resolve open reports and apply the V1 moderation actions." />
        <AdminQuickLink href="/admin/events" label="Events" hint="Create and update promoted events and placements." />
        <AdminQuickLink href="/admin/audit-logs" label="Audit Logs" hint="Review sensitive admin actions and keep the audit trail visible." />
      </section>
    </main>
  );
}
