import Link from "next/link";
import { signInAction, signInWithGoogleAction } from "../actions";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <form action={signInAction} className="flex flex-col gap-3">
        <input className="rounded-md border p-2" name="email" type="email" placeholder="Email" required />
        <input className="rounded-md border p-2" name="password" type="password" placeholder="Password" required />
        <button className="rounded-md bg-primary p-2 text-primary-foreground" type="submit">
          Sign in
        </button>
      </form>
      <form action={signInWithGoogleAction}>
        <button className="w-full rounded-md border p-2" type="submit">
          Continue with Google
        </button>
      </form>
      <p className="text-sm text-muted-foreground">
        No account? <Link className="underline" href="/register">Create one</Link>
      </p>
    </main>
  );
}