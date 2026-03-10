import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
      <p className="text-sm">Milestone 1 RBAC guard is active for admin routes.</p>
    </main>
  );
}