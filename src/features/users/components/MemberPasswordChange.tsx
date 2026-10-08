"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OtpCodeInput } from "@/features/auth/components/OtpCodeInput";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { changeMemberPasswordWithCurrentPasswordAction, changeMemberPasswordWithOtpAction, requestMemberPasswordChangeOtpAction } from "@/features/users/actions/member-password.actions";

type Method = "current-password" | "email-code";
export function MemberPasswordChange({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<Method>("current-password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attempts, setAttempts] = useState(5);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [expiresSeconds, setExpiresSeconds] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => { if (resendSeconds <= 0) return; const timer = window.setTimeout(() => setResendSeconds((n) => Math.max(0, n - 1)), 1000); return () => window.clearTimeout(timer); }, [resendSeconds]);
  useEffect(() => { if (!otpSent || expiresSeconds <= 0) return; const timer = window.setTimeout(() => setExpiresSeconds((n) => Math.max(0, n - 1)), 1000); return () => window.clearTimeout(timer); }, [expiresSeconds, otpSent]);

  const clear = () => { setCurrentPassword(""); setPassword(""); setConfirmPassword(""); setCode(""); setOtpSent(false); setAttempts(5); setExpiresSeconds(0); setError(""); setNotice(""); };
  const submitCurrent = (event: FormEvent) => { event.preventDefault(); setError(""); startTransition(async () => {
    const result = await changeMemberPasswordWithCurrentPasswordAction({ currentPassword, password, confirmPassword });
    if (!result.success) { setError(result.error || "Unable to change your password."); return; }
    clear(); setOpen(false); setNotice(("message" in result && result.message) || "Password updated."); router.refresh();
  }); };
  const requestCode = () => { setError(""); setNotice(""); startTransition(async () => {
    const result = await requestMemberPasswordChangeOtpAction();
    if (!result.success) { setError(result.error || "Could not send a verification code."); if (result.resendAvailableAt) setResendSeconds(Math.max(0, Math.ceil((new Date(result.resendAvailableAt).getTime() - Date.now()) / 1000))); return; }
    setOtpSent(true); setCode(""); setAttempts(5); setNotice(result.message || "A verification code was sent to your current account email.");
    if (result.resendAvailableAt) setResendSeconds(Math.max(0, Math.ceil((new Date(result.resendAvailableAt).getTime() - Date.now()) / 1000)));
    if (result.expiresAt) setExpiresSeconds(Math.max(0, Math.ceil((new Date(result.expiresAt).getTime() - Date.now()) / 1000)));
  }); };
  const submitOtp = (event: FormEvent) => { event.preventDefault(); setError(""); startTransition(async () => {
    const result = await changeMemberPasswordWithOtpAction({ code, password, confirmPassword });
    if (!result.success) { setError(result.error || "Unable to change your password."); if (result.attemptsRemaining !== undefined) setAttempts(result.attemptsRemaining); return; }
    clear(); setOpen(false); setNotice(("message" in result && result.message) || "Password updated."); router.refresh();
  }); };
  const choose = (next: Method) => { setMethod(next); setError(""); setNotice(""); if (next === "current-password") { setOtpSent(false); setCode(""); setExpiresSeconds(0); } };

  return <section className="min-w-0 py-6" aria-labelledby="member-password-heading">
    <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground" aria-hidden="true"><KeyRound className="size-4" /></span><div><h2 id="member-password-heading" className="text-base font-semibold text-foreground">Password</h2><p className="mt-1 text-sm text-muted-foreground">Protect sign-in with a password that only you know.</p></div></div><Button type="button" variant="outline" className="min-h-11 w-full min-[420px]:w-auto" aria-expanded={open} aria-controls="member-password-form" onClick={() => setOpen((value) => !value)} disabled={pending}>{open ? "Close" : "Change password"}</Button></div>
    {open && <div id="member-password-form" className="mt-4 space-y-4"><fieldset className="space-y-2"><legend className="text-sm font-medium text-foreground">Confirm it’s you</legend><div className="flex flex-wrap gap-2"><Button type="button" size="sm" className="min-h-11" variant={method === "current-password" ? "default" : "outline"} aria-pressed={method === "current-password"} onClick={() => choose("current-password")} disabled={pending}>Current password</Button><Button type="button" size="sm" className="min-h-11" variant={method === "email-code" ? "default" : "outline"} aria-pressed={method === "email-code"} onClick={() => choose("email-code")} disabled={pending}>Email code</Button></div></fieldset>
      {method === "current-password" ? <form className="space-y-4" onSubmit={submitCurrent}><PasswordField id="member-current-password" label="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" disabled={pending} /><PasswordField id="member-new-password" label="New password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" disabled={pending} /><PasswordField id="member-confirm-password" label="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" disabled={pending} /><Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={pending}>{pending ? "Updating…" : "Update password"}</Button></form> : <div className="space-y-4"><p className="text-sm leading-relaxed text-muted-foreground">{currentEmail ? <>We’ll send a code to {maskEmail(currentEmail)}.</> : "Add an account email before using email verification."}</p>{!otpSent ? <Button type="button" className="min-h-11 w-full sm:w-auto" onClick={requestCode} disabled={pending || resendSeconds > 0 || !currentEmail}>{pending ? "Sending…" : resendSeconds > 0 ? `Try again in ${resendSeconds}s` : "Send verification code"}</Button> : <form className="space-y-4" onSubmit={submitOtp}><p role="status" className="text-sm text-muted-foreground">{notice}</p><div className="space-y-2"><Label htmlFor="member-password-code">Verification code</Label><OtpCodeInput id="member-password-code" value={code} onChange={(value) => { setCode(value); setError(""); }} disabled={pending || expiresSeconds === 0 || attempts === 0} autoFocus /><p className="text-xs text-muted-foreground">{attempts} {attempts === 1 ? "attempt" : "attempts"} remaining · {expiresSeconds > 0 ? `Code expires in ${Math.floor(expiresSeconds / 60)}:${String(expiresSeconds % 60).padStart(2, "0")}` : "Code expired; send a new one to continue"}</p></div><PasswordField id="member-otp-new-password" label="New password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" disabled={pending || expiresSeconds === 0 || attempts === 0} /><PasswordField id="member-otp-confirm-password" label="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" disabled={pending || expiresSeconds === 0 || attempts === 0} /><div className="flex flex-wrap gap-2"><Button type="submit" className="min-h-11 w-full min-[420px]:w-auto" disabled={pending || code.length !== 6 || expiresSeconds === 0 || attempts === 0}>{pending ? "Updating…" : "Update password"}</Button><Button type="button" variant="outline" className="min-h-11 w-full min-[420px]:w-auto" onClick={requestCode} disabled={pending || resendSeconds > 0}>{resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Send a new code"}</Button></div></form>}</div>}
    </div>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{notice && !open && <p role="status" className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">{notice}</p>}
  </section>;
}

function maskEmail(email: string) { const [name, domain] = email.split("@"); return name && domain ? `${name[0]}${"•".repeat(Math.min(5, Math.max(2, name.length - 1)))}@${domain}` : email; }
