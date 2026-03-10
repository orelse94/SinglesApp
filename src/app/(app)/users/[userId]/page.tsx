import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session?.user) {
    notFound();
  }

  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      displayName: true,
      bio: true,
      profileVisibility: true,
      verificationStatus: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">{user.displayName}</h1>
      <p className="text-sm text-muted-foreground">Visibility: {user.profileVisibility}</p>
      <p className="text-sm text-muted-foreground">Verification: {user.verificationStatus}</p>
      <p className="text-sm">{user.bio ?? "No bio"}</p>
    </main>
  );
}
