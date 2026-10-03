"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyOtpAction, resendOtpAction } from "../actions/otp.action";
import { ROLES } from "../constants";

export const VerifyEmailForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    startTransition(async () => {
      const res = await verifyOtpAction({ email, code });
      if (!res.success) {
        setError(res.error || "Verification failed");
        return;
      }

      setInfo(res.message || "Verified! Redirecting...");
      const role = (res.data as { role?: string } | undefined)?.role;
      const destination =
        role === ROLES.STAFF ? "/staff/pos" : role === ROLES.ADMIN ? "/admin" : "/member/profile";
      setTimeout(() => router.push(destination), 1000);
    });
  };

  const handleResend = () => {
    if (cooldown > 0 || !email) return;
    setError(null);
    setInfo(null);

    startTransition(async () => {
      const res = await resendOtpAction({ email });
      if (!res.success) {
        setError(res.error || "Failed to resend code");
        return;
      }

      setInfo(res.message || "A new code has been sent");
      setCooldown(60);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
          {info}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="code">6-digit Verification Code</Label>
        <Input
          id="code"
          type="text"
          maxLength={6}
          placeholder="123456"
          required
          className="text-center font-mono tracking-widest text-lg h-12"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          disabled={isPending}
        />
      </div>

      <Button type="submit" className="w-full h-11" disabled={isPending || code.length !== 6}>
        {isPending ? "Verifying..." : "Verify Email"}
      </Button>

      <div className="flex items-center justify-between text-sm pt-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isPending || !email}
          className="text-primary hover:underline font-medium disabled:opacity-50 disabled:no-underline cursor-pointer"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>

        <Link href="/login" className="text-muted-foreground hover:underline">
          Back to Login
        </Link>
      </div>
    </form>
  );
};
