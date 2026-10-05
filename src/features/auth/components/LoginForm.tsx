"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        const res = await loginAction({ email, password });
        if (!res.success) {
          const message = res.error || "Failed to log in";
          setError(message);
          toast.error(message);
          return;
        }

        toast.success(`Welcome back, ${(res.data as { firstName?: string })?.firstName || "there"}`);
        const role = (res.data as { role?: string })?.role;
        router.push(getSafeRoleRedirect(redirectTo, role) ?? getRoleHome(role));
        router.refresh();
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
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
        />
      </div>

      <Button type="submit" className="w-full h-11" disabled={isPending}>
        {isPending ? "Logging in..." : "Sign in"}
      </Button>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        Need an account? Please ask the shop team to start your registration.
      </p>
    </form>
  );
};
