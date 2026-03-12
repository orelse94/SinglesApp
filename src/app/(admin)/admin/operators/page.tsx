import { AdminErrorBanner, AdminPageIntro, SavedMessageBanner } from "../lib";
import { AdminUsersSection } from "../sections";

export default async function AdminUsersDirectoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; expanded?: string; error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="space-y-6">
      <SavedMessageBanner saved={resolvedSearchParams?.saved} />
      <AdminErrorBanner error={resolvedSearchParams?.error} />
      <AdminPageIntro eyebrow="Admin Users" title="Operational admin accounts" description="Create operational-only admin accounts here, then expand a row to update status, role, or the test-user flag." />
      <AdminUsersSection expandedUserId={resolvedSearchParams?.expanded} tab="operators" />
    </main>
  );
}
