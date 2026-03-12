import { AdminPageIntro } from "../lib";
import { AdminAuditLogsSection } from "../sections";

export default function AdminAuditLogsPage() {
  return (
    <main className="space-y-6">
      <AdminPageIntro eyebrow="Audit Logs" title="Audit trail" description="Keep recent sensitive admin actions visible without mixing them into the operational screens." />
      <AdminAuditLogsSection />
    </main>
  );
}
