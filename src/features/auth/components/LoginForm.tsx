"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "./PasswordField";
import { loginAction } from "../actions/login.action";
import { ROLES } from "../constants";

const getRoleHome = (role?: string) => {
  if (role === ROLES.ADMIN) return "/admin";
  if (role === ROLES.STAFF) return "/staff";
  return "/member";
};

const getSafeRoleRedirect = (redirectTo: string | undefined, role?: string) => {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//") || redirectTo.includes("\\")) {
    return null;
  }

  const home = getRoleHome(role);
  try {
    const target = new URL(redirectTo, "https://hrungmoto.invalid");
    if (target.origin !== "https://hrungmoto.invalid") return null;
    if (target.pathname !== home && !target.pathname.startsWith(`${home}/`)) return null;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return null;
  }
};

export const LoginForm: React.FC<{ redirectTo?: string }> = ({ redirectTo }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const actionStartedAt = performance.now();
        const res = await loginAction({ email, password });
        if (process.env.NODE_ENV === "development") console.info(`[auth-perf] login_action_roundtrip_ms: ${(performance.now() - actionStartedAt).toFixed(1)}ms`);
        if (!res.success) {
          const message = res.error || "Failed to log in";
          setError(message);
          toast.error(message);
          return;
        }

        toast.success(`Welcome back, ${(res.data as { firstName?: string })?.firstName || "there"}`);
        const role = (res.data as { role?: string })?.role;
        window.sessionStorage.setItem("moto-care-login-navigation-start", String(performance.now()));
        router.push(getSafeRoleRedirect(redirectTo, role) ?? getRoleHome(role));
      } catch {
        const message = "Unable to sign in right now. Please try again.";
        setError(message);
        toast.error(message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          className="text-base"
          placeholder="name@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
        />
      </div>

      <PasswordField
        id="password"
        label="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        minLength={4}
        placeholder="Enter your password"
        disabled={isPending}
      />

      <div className="-mt-1 flex justify-end">
        <Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full h-11 text-base" disabled={isPending}>
        {isPending ? "Logging in..." : "Sign in"}
      </Button>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        Need an account? Please ask the shop team to start your registration.
      </p>
    </form>
  );
};
