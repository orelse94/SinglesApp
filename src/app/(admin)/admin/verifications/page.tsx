import { AdminPageIntro, SavedMessageBanner } from "../lib";
import { AdminVerificationsSection } from "../sections";

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="space-y-6">
      <SavedMessageBanner saved={resolvedSearchParams?.saved} />
      <AdminPageIntro eyebrow="Verifications" title="Verification queue" description="Review pending verification requests in their own focused admin workspace." />
      <AdminVerificationsSection />
    </main>
  );
}
