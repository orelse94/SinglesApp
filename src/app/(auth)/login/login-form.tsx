"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const GENERIC_SIGN_IN_ERROR = "We couldn’t sign you in. If the problem continues, please contact support.";

export function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  function submitCredentials(formData: FormData) {
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
        setErrorMessage(GENERIC_SIGN_IN_ERROR);
        return;
      }

      const payload = (await response.json()) as { redirectTo?: string };
      router.push(payload.redirectTo ?? "/home");
      router.refresh();
    });
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        submitCredentials(new FormData(event.currentTarget));
      }}
    >
      {errorMessage ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {errorMessage}
        </div>
      ) : null}
      <input className="rounded-md border p-2" name="email" type="email" placeholder="Email" required />
      <input className="rounded-md border p-2" name="password" type="password" placeholder="Password" required />
      <button
        className="rounded-md bg-primary p-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!isHydrated || isPending}
        onClick={(event) => {
          const form = event.currentTarget.form;
          if (!form) {
            return;
          }

          event.preventDefault();
          submitCredentials(new FormData(form));
        }}
        type="button"
      >
        {!isHydrated ? "Loading..." : isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
