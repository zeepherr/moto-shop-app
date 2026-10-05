"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyOtpAction, resendOtpAction } from "../actions/otp.action";
import { ROLES } from "../constants";
import { OtpMotionScene } from "./OtpMotionScene";
import { OtpCodeInput } from "./OtpCodeInput";

export const VerifyEmailForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const deliveryFailed = searchParams.get("delivery") === "retry";
  const codeSent = searchParams.get("sent") === "1";

  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(
    deliveryFailed
      ? "We couldn't deliver the first code. You can request a new one now."
      : codeSent
        ? "A verification code was sent. Check your inbox and spam folder."
        : null,
  );
  const [cooldown, setCooldown] = useState(deliveryFailed ? 0 : codeSent ? 60 : 0);
  const [showRegisterAgain, setShowRegisterAgain] = useState(false);
  const [verified, setVerified] = useState(false);

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
        setVerified(false);
        setError(res.error || "Verification failed");
        setShowRegisterAgain(res.code === "REGISTRATION_NOT_FOUND");
        return;
      }

      setInfo(res.message || "Verified! Redirecting...");
      setVerified(true);
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
        setShowRegisterAgain(res.code === "REGISTRATION_NOT_FOUND");
        return;
      }

      setInfo(res.message || "A new code has been sent");
      setShowRegisterAgain(false);
      setCooldown(60);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <OtpMotionScene verified={verified} compact />
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {info && (
        <div role="status" aria-live="polite" className="rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
          {info}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="code">6-digit Verification Code</Label>
        <OtpCodeInput id="code" value={code} onChange={(value) => { setCode(value); setError(null); }} disabled={isPending} invalid={!!error} verified={verified} />
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
      {showRegisterAgain ? (
        <p className="text-center text-sm text-muted-foreground">
          Have an approved email? <Link href="/register" className="font-semibold text-primary hover:underline">Start registration again</Link>
        </p>
      ) : null}
    </form>
  );
};
