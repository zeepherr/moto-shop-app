"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { OtpCodeInput } from "@/features/auth/components/OtpCodeInput";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from "@/features/auth/constants";
import { completeAdminPasswordResetAction, requestAdminPasswordResetAction } from "@/features/auth/actions/admin-password-reset.action";

type RecoveryStep = "request" | "reset" | "complete";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<RecoveryStep>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const [expiresSeconds, setExpiresSeconds] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (step !== "reset" || expiresSeconds <= 0) return;
    const timer = window.setTimeout(() => setExpiresSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [expiresSeconds, step]);

  const requestCode = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const requestedAt = Date.now();
    startTransition(async () => {
      const result = await requestAdminPasswordResetAction({ email });
      if (!result.success) {
        setError(result.error || "Enter a valid email address.");
        return;
      }
      setStep("reset");
      setCode("");
      setNotice(result.message || "If an active admin account matches, check its inbox for reset instructions.");
      setResendSeconds(Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000));
      setExpiresSeconds(Math.max(0, Math.ceil(OTP_TTL_MS / 1000) - Math.ceil((Date.now() - requestedAt) / 1000)));
    });
  };

  const resendCode = () => {
    setError("");
    const requestedAt = Date.now();
    startTransition(async () => {
      const result = await requestAdminPasswordResetAction({ email });
      if (!result.success) {
        setError(result.error || "Could not request another code.");
        return;
      }
      setCode("");
      setNotice(result.message || "If an active admin account matches, check its inbox for reset instructions.");
      setResendSeconds(Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000));
      setExpiresSeconds(Math.max(0, Math.ceil(OTP_TTL_MS / 1000) - Math.ceil((Date.now() - requestedAt) / 1000)));
    });
  };

  const resetPassword = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    startTransition(async () => {
      const result = await completeAdminPasswordResetAction({ email, code, password, confirmPassword });
      if (!result.success) {
        setError(result.error || "Unable to reset your password.");
        return;
      }
      setNotice(result.message || "Your password has been reset. Sign in with your new password.");
      setStep("complete");
      setCode("");
      setPassword("");
      setConfirmPassword("");
    });
  };

  const useDifferentEmail = () => {
    setStep("request");
    setCode("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setNotice("");
    setExpiresSeconds(0);
  };

  return (
    <div className="space-y-8">
      <AuthHeader
        title={step === "complete" ? "Password reset" : step === "reset" ? "Set a new password" : "Forgot password?"}
        description={step === "complete"
          ? "Your password is ready to use."
          : step === "reset"
            ? "Enter the code and choose a new password for your admin account."
            : "Enter your admin account email to start a secure password reset."}
      />

      {notice && <p role="status" aria-live="polite" className="rounded-xl bg-primary/5 p-3 text-sm leading-relaxed text-foreground">{notice}</p>}
      {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      {step === "request" && (
        <form onSubmit={requestCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recovery-email">Admin email</Label>
            <Input id="recovery-email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending} />
          </div>
          <Button type="submit" className="h-11 w-full text-base" disabled={pending}>
            {pending ? "Requesting code…" : "Send reset code"}
          </Button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={resetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-code">Verification code</Label>
            <OtpCodeInput id="reset-code" value={code} onChange={setCode} disabled={pending || expiresSeconds === 0} autoFocus />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Enter the code sent to {email}, if an active admin account matches this address. {expiresSeconds > 0
                ? `Expires in ${Math.floor(expiresSeconds / 60)}:${String(expiresSeconds % 60).padStart(2, "0")}.`
                : "This code has expired. Request a new one to continue."}
            </p>
          </div>
          <PasswordField id="new-password" label="New password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" disabled={pending || expiresSeconds === 0} />
          <PasswordField id="confirm-new-password" label="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" disabled={pending || expiresSeconds === 0} />
          <p className="text-xs leading-relaxed text-muted-foreground">Other sessions are revoked and may take up to 15 minutes to sign out.</p>
          <Button type="submit" className="h-11 w-full text-base" disabled={pending || code.length !== 6 || expiresSeconds === 0}>
            {pending ? "Resetting password…" : "Reset password"}
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <Button type="button" variant="link" className="h-auto p-0" onClick={resendCode} disabled={pending || resendSeconds > 0}>
              {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}
            </Button>
            <Button type="button" variant="link" className="h-auto p-0" onClick={useDifferentEmail} disabled={pending}>Use a different email</Button>
          </div>
        </form>
      )}

      {step === "complete" && (
        <Link href="/login" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-base font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          Return to sign in
        </Link>
      )}

      {step !== "complete" && (
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">Back to sign in</Link>
        </p>
      )}
    </div>
  );
}
