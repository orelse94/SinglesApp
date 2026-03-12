import { AdminPageIntro, SavedMessageBanner } from "../lib";
import { AdminEventsSection } from "../sections";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="space-y-6">
      <SavedMessageBanner saved={resolvedSearchParams?.saved} />
      <AdminPageIntro eyebrow="Events" title="Promoted events" description="Manage promoted event inventory and placements in a dedicated admin area." />
      <AdminEventsSection />
    </main>
  );
}
