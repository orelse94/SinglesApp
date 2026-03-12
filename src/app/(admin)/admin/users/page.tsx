import { AdminPageIntro, SavedMessageBanner } from "../lib";
import { AdminUsersSection } from "../sections";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; expanded?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="space-y-6">
      <SavedMessageBanner saved={resolvedSearchParams?.saved} />
      <AdminPageIntro eyebrow="Users" title="User directory" description="Review all regular member accounts here, then expand a row when you need to update status or role." />
      <AdminUsersSection expandedUserId={resolvedSearchParams?.expanded} tab="members" />
    </main>
  );
}
