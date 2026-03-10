import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Discreet Community MVP</h1>
      <p className="text-sm text-muted-foreground">
        Mobile-first, consent-first social space. Milestone 1 scaffold is ready.
      </p>
      <div className="flex gap-3">
        <Link className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" href="/register">
          Register
        </Link>
        <Link className="rounded-md border px-4 py-2 text-sm" href="/login">
          Login
        </Link>
      </div>
    </main>
  );
}