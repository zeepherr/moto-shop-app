"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OtpCodeInput } from "@/features/auth/components/OtpCodeInput";
import { PasswordField } from "@/features/auth/components/PasswordField";
import {
  changeStaffPasswordWithCurrentPasswordAction,
  changeStaffPasswordWithOtpAction,
  requestStaffPasswordChangeOtpAction,
} from "@/features/users/actions/staff-password.actions";

type VerificationMethod = "current-password" | "email-code";

const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name[0]}${"•".repeat(Math.min(5, Math.max(2, name.length - 1)))}@${domain}`;
};

export function StaffPasswordChange({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<VerificationMethod>("current-password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [expiresSeconds, setExpiresSeconds] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (!otpSent || expiresSeconds <= 0) return;
    const timer = window.setTimeout(() => setExpiresSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [expiresSeconds, otpSent]);

  const clearFields = () => {
    setCurrentPassword("");
    setPassword("");
    setConfirmPassword("");
    setCode("");
    setOtpSent(false);
    setAttemptsRemaining(5);
    setExpiresSeconds(0);
    setError("");
    setEmailNotice("");
  };

  const updateWithCurrentPassword = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await changeStaffPasswordWithCurrentPasswordAction({ currentPassword, password, confirmPassword });
      if ("error" in result) {
        setError(result.error || "Unable to change your password.");
        return;
      }
      clearFields();
      setOpen(false);
      toast.success(result.message || "Password updated.");
      router.refresh();
    });
  };

  const requestEmailCode = () => {
    setError("");
    setEmailNotice("");
    startTransition(async () => {
      const result = await requestStaffPasswordChangeOtpAction();
      if ("error" in result) {
        setError(result.error || "Could not send a verification code.");
        if (result.resendAvailableAt) {
          setResendSeconds(Math.max(0, Math.ceil((new Date(result.resendAvailableAt).getTime() - Date.now()) / 1000)));
        }
        return;
      }
      setOtpSent(true);
      setCode("");
      setAttemptsRemaining(5);
      setEmailNotice(result.message || `A verification code was sent to ${maskEmail(currentEmail)}.`);
      if (result.resendAvailableAt) {
        setResendSeconds(Math.max(0, Math.ceil((new Date(result.resendAvailableAt).getTime() - Date.now()) / 1000)));
      }
      if (result.expiresAt) {
        setExpiresSeconds(Math.max(0, Math.ceil((new Date(result.expiresAt).getTime() - Date.now()) / 1000)));
      }
    });
  };

  const updateWithEmailCode = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await changeStaffPasswordWithOtpAction({ code, password, confirmPassword });
      if ("error" in result) {
        setError(result.error || "Unable to change your password.");
        if (result.attemptsRemaining !== undefined) setAttemptsRemaining(result.attemptsRemaining);
        return;
      }
      clearFields();
      setOpen(false);
      toast.success(result.message || "Password updated.");
      router.refresh();
    });
  };

  const selectMethod = (nextMethod: VerificationMethod) => {
    setMethod(nextMethod);
    setError("");
    setEmailNotice("");
    if (nextMethod === "current-password") {
      setOtpSent(false);
      setCode("");
      setExpiresSeconds(0);
    }
  };

  return (
    <section className="min-w-0 py-6" aria-labelledby="staff-password-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground" aria-hidden="true"><KeyRound className="size-4" /></span>
          <div className="min-w-0">
            <h2 id="staff-password-heading" className="text-base font-semibold text-foreground">Password</h2>
            <p className="mt-1 text-sm text-muted-foreground">Update the password used to sign in to your staff account.</p>
          </div>
        </div>
        <Button type="button" size="sm" variant="outline" className="min-h-11 w-full min-[420px]:w-auto" aria-expanded={open} aria-controls="staff-password-form" onClick={() => setOpen((value) => !value)} disabled={pending}>
          {open ? "Close" : "Change password"}
        </Button>
      </div>

      {open && (
        <div id="staff-password-form" className="mt-4 space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Confirm it’s you</legend>
            <div className="flex flex-wrap gap-2" aria-label="Password verification method">
              <Button type="button" size="sm" className="min-h-11" variant={method === "current-password" ? "default" : "outline"} aria-pressed={method === "current-password"} onClick={() => selectMethod("current-password")} disabled={pending}>
                Current password
              </Button>
              <Button type="button" size="sm" className="min-h-11" variant={method === "email-code" ? "default" : "outline"} aria-pressed={method === "email-code"} onClick={() => selectMethod("email-code")} disabled={pending}>
                Email code
              </Button>
            </div>
          </fieldset>

          {method === "current-password" ? (
            <form className="space-y-4" onSubmit={updateWithCurrentPassword}>
              <PasswordField id="staff-current-password" label="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" disabled={pending} />
              <PasswordField id="staff-new-password" label="New password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" disabled={pending} />
              <PasswordField id="staff-confirm-password" label="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" disabled={pending} />
              <Button type="submit" size="sm" className="min-h-11 w-full sm:w-auto" disabled={pending}>{pending ? "Updating password…" : "Update password"}</Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {currentEmail
                  ? <>We’ll send a code to {maskEmail(currentEmail)}. The code goes to your current account email, even if an email change is pending.</>
                  : "Add an account email before using email verification."}
              </p>
              {!otpSent ? (
                <Button type="button" size="sm" className="min-h-11 w-full sm:w-auto" onClick={requestEmailCode} disabled={pending || resendSeconds > 0 || !currentEmail}>
                  {pending ? "Sending code…" : resendSeconds > 0 ? `Try again in ${resendSeconds}s` : "Send verification code"}
                </Button>
              ) : (
                <form className="space-y-4" onSubmit={updateWithEmailCode}>
                  {emailNotice && <p role="status" className="text-sm text-muted-foreground">{emailNotice}</p>}
                  <div className="space-y-2">
                    <Label htmlFor="staff-password-change-code">Verification code</Label>
                    <OtpCodeInput id="staff-password-change-code" value={code} onChange={(value) => { setCode(value); setError(""); }} disabled={pending || expiresSeconds === 0 || attemptsRemaining === 0} autoFocus />
                    <p className="text-xs text-muted-foreground">
                      {attemptsRemaining} {attemptsRemaining === 1 ? "attempt" : "attempts"} remaining · {expiresSeconds > 0
                        ? `Code expires in ${Math.floor(expiresSeconds / 60)}:${String(expiresSeconds % 60).padStart(2, "0")}`
                        : "Code expired; send a new one to continue"}
                    </p>
                  </div>
                  <PasswordField id="staff-email-new-password" label="New password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" disabled={pending || expiresSeconds === 0 || attemptsRemaining === 0} />
                  <PasswordField id="staff-email-confirm-password" label="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" disabled={pending || expiresSeconds === 0 || attemptsRemaining === 0} />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" size="sm" className="min-h-11 w-full min-[420px]:w-auto" disabled={pending || code.length !== 6 || expiresSeconds === 0 || attemptsRemaining === 0}>
                      {pending ? "Updating password…" : "Update password"}
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="min-h-11 w-full min-[420px]:w-auto" onClick={requestEmailCode} disabled={pending || resendSeconds > 0}>
                      {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Send a new code"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
      )}
    </section>
  );
}
