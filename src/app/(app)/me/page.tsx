import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export default async function MePage() {
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { displayName: true, email: true, settings: { select: { themePreference: true } } },
      })
    : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">My profile</h1>
      <p className="text-sm">Display name: {user?.displayName}</p>
      <p className="text-sm">Email: {user?.email}</p>
      <p className="text-sm">Theme: {user?.settings?.themePreference ?? "LIGHT"}</p>
    </main>
  );
}