"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setPasswordAction } from "../actions/password-setup.action";

export function PasswordSetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await setPasswordAction({ token, password, confirmPassword });
      if (!result.success) {
        setError(result.error || "Unable to set your password.");
        return;
      }
      setMessage(result.message || "Password created. Redirecting to sign in...");
      setTimeout(() => router.push("/login"), 900);
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error ? <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="rounded-xl bg-success/10 p-3 text-sm text-success">{message}</p> : null}

      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isPending}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isPending}
          required
        />
      </div>
      <Button className="h-11 w-full" disabled={isPending || !token} type="submit">
        {isPending ? "Saving password..." : "Set password"}
      </Button>
    </form>
  );
}
