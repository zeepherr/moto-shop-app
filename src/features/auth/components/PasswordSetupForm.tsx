"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setPasswordAction } from "../actions/password-setup.action";
import { PasswordField } from "./PasswordField";

export function PasswordSetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [invalidLink, setInvalidLink] = useState(!token);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await setPasswordAction({ token, password, confirmPassword });
      if (!result.success) {
        setError(result.error || "Unable to set your password.");
        setInvalidLink(result.code === "PASSWORD_SETUP_LINK_INVALID");
        return;
      }
      setMessage(result.message || "Password created. Redirecting to sign in...");
      setTimeout(() => router.push("/login"), 900);
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error ? <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p role="status" aria-live="polite" className="rounded-xl bg-success/10 p-3 text-sm text-success">{message}</p> : null}

      {invalidLink ? (
        <div className="space-y-4 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Ask the shop team to send you a new password setup link, then open it from your email.
          </p>
          <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Return to sign in
          </Link>
        </div>
      ) : (
        <>
          <PasswordField
            id="password"
            label="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            disabled={isPending}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            disabled={isPending}
          />
          <Button className="h-11 w-full text-base" disabled={isPending} type="submit">
            {isPending ? "Saving password..." : "Set password"}
          </Button>
        </>
      )}
    </form>
  );
}
