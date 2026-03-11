"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "").toLowerCase();
        const password = String(formData.get("password") ?? "");

        startTransition(async () => {
          setErrorMessage(null);

          const response = await fetch("/api/credentials-login", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            setErrorMessage("The email/password combination was not accepted. If this account was created with Google, use Google sign-in instead.");
            return;
          }

          const payload = (await response.json()) as { redirectTo?: string };
          router.push(payload.redirectTo ?? "/home");
          router.refresh();
        });
      }}
    >
      {errorMessage ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {errorMessage}
        </div>
      ) : null}
      <input className="rounded-md border p-2" name="email" type="email" placeholder="Email" required />
      <input className="rounded-md border p-2" name="password" type="password" placeholder="Password" required />
      <button className="rounded-md bg-primary p-2 text-primary-foreground disabled:opacity-60" disabled={isPending} type="submit">
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
