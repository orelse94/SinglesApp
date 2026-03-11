import Link from "next/link";
import { signInWithGoogleAction } from "../actions";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <LoginForm />
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
