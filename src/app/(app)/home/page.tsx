import { auth, signOut } from "@/auth";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">Home</h1>
      <p className="text-sm text-muted-foreground">
        Signed in as {session?.user?.email ?? "unknown"}
      </p>
      <form action={signOutAction}>
        <button className="rounded-md border px-4 py-2 text-sm" type="submit">
          Sign out
        </button>
      </form>
    </main>
  );
}