"use client";

import { useEffect, useState, useTransition } from "react";
import { BadgeCheck, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from "@/features/auth/constants";
import { cancelMemberEmailChangeAction, requestMemberEmailChangeAction, verifyMemberEmailChangeAction } from "@/features/users/actions/email-change.actions";
import { StaffEmailEditor } from "./StaffEmailEditor";
import { StaffEmailVerification } from "./StaffEmailVerification";

type PendingRequest = { newEmail: string; otpExpiresAt: string; otpAttempts: number };
type Mode = "view" | "edit" | "verify";

export function MemberEmailChange({ currentEmail, emailVerified, resendCooldownSeconds, expiresSeconds: initialExpires, pendingRequest }: {
  currentEmail: string; emailVerified: boolean; resendCooldownSeconds: number; expiresSeconds: number; pendingRequest: PendingRequest | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(pendingRequest?.newEmail ?? currentEmail);
  const [savedEmail, setSavedEmail] = useState(currentEmail);
  const [verified, setVerified] = useState(emailVerified);
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<Mode>(pendingRequest ? "verify" : "view");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [attempts, setAttempts] = useState(pendingRequest ? Math.max(0, 5 - pendingRequest.otpAttempts) : 5);
  const [resendSeconds, setResendSeconds] = useState(resendCooldownSeconds);
  const [expiresSeconds, setExpiresSeconds] = useState(initialExpires);
  const [pending, startTransition] = useTransition();

  useEffect(() => { if (resendSeconds <= 0) return; const timer = window.setTimeout(() => setResendSeconds((n) => Math.max(0, n - 1)), 1000); return () => window.clearTimeout(timer); }, [resendSeconds]);
  useEffect(() => { if (mode !== "verify" || expiresSeconds <= 0) return; const timer = window.setTimeout(() => setExpiresSeconds((n) => Math.max(0, n - 1)), 1000); return () => window.clearTimeout(timer); }, [expiresSeconds, mode]);

  const requestCode = () => startTransition(async () => {
    setError(""); setNotice("");
    try {
      const result = await requestMemberEmailChangeAction({ email });
      if (!result.success) { setError(result.error || "Could not send a verification code."); if (result.resendAvailableAt) setResendSeconds(Math.max(0, Math.ceil((new Date(result.resendAvailableAt).getTime() - Date.now()) / 1000))); return; }
      setCode(""); setInvalid(false); setMode("verify"); setResendSeconds(OTP_RESEND_COOLDOWN_MS / 1000); setExpiresSeconds(OTP_TTL_MS / 1000); setAttempts(5);
    } catch { setError("Could not send a verification code. Check your connection and try again."); }
  });

  const verify = () => startTransition(async () => {
    setError(""); setInvalid(false);
    try {
      const result = await verifyMemberEmailChangeAction({ code });
      if (!result.success) { setError(result.error || "Email could not be verified."); setInvalid(true); if (result.attemptsRemaining !== undefined) setAttempts(result.attemptsRemaining); return; }
      const nextEmail = result.email ?? email; setSavedEmail(nextEmail); setEmail(nextEmail); setVerified(true); setCode(""); setMode("view"); setAttempts(5); setNotice(result.message || "Email address updated and verified."); router.refresh();
    } catch { setError("Email could not be verified. Check your connection and try again."); setInvalid(true); }
  });

  const cancel = () => startTransition(async () => {
    try { const result = await cancelMemberEmailChangeAction(); if (!result.success) { setError(result.error || "Could not cancel the email change."); return; } setMode("view"); setEmail(savedEmail); setCode(""); setError(""); setNotice(""); setAttempts(5); }
    catch { setError("Could not cancel the email change. Check your connection and try again."); }
  });

  return (
    <section className="min-w-0 py-6" aria-labelledby="member-email-heading">
      <h2 id="member-email-heading" className="text-base font-semibold text-foreground">Email address</h2>
      <p className="mt-1 text-sm text-muted-foreground">Your email is used to sign in and recover your account.</p>
      {mode === "view" ? <div className="mt-4 flex min-w-0 flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
        <div className="flex min-w-0 items-start gap-3"><Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><div className="min-w-0"><p className="break-all text-sm font-medium text-foreground">{savedEmail || "No email on file"}</p><p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><BadgeCheck className={`size-3.5 ${verified ? "text-emerald-600 dark:text-emerald-400" : ""}`} />{verified ? "Verified" : "Not verified"}</p></div></div>
        <Button type="button" variant="outline" className="min-h-11 w-full min-[420px]:w-auto" onClick={() => { setEmail(savedEmail); setMode("edit"); setError(""); setNotice(""); }} disabled={pending}>Change email</Button>
      </div> : mode === "edit" ? <StaffEmailEditor email={email} savedEmail={savedEmail} resendSeconds={resendSeconds} pending={pending} onEmailChange={setEmail} onRequestCode={requestCode} onCancel={() => { setMode("view"); setEmail(savedEmail); setError(""); }} /> : <StaffEmailVerification email={email} code={code} invalidCode={invalid} expiresSeconds={expiresSeconds} attemptsRemaining={attempts} resendSeconds={resendSeconds} pending={pending} onCodeChange={(value) => { setCode(value); setInvalid(false); setError(""); }} onVerify={verify} onResend={requestCode} onCancel={cancel} />}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}{notice && <p role="status" className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">{notice}</p>}
    </section>
  );
}
