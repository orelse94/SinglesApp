import { AdminPageIntro, SavedMessageBanner } from "../lib";
import { AdminReportsSection } from "../sections";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="space-y-6">
      <SavedMessageBanner saved={resolvedSearchParams?.saved} />
      <AdminPageIntro eyebrow="Reports" title="Open reports" description="Handle member reports and apply only the moderation actions needed for the current V1 scope." />
      <AdminReportsSection />
    </main>
  );
}
