"use client";

import { Button } from "@/components/ui/button";
import { OtpCodeInput } from "@/features/auth/components/OtpCodeInput";

export function StaffEmailVerification({
  email,
  code,
  invalidCode,
  expiresSeconds,
  attemptsRemaining,
  resendSeconds,
  pending,
  onCodeChange,
  onVerify,
  onResend,
  onCancel,
}: {
  email: string;
  code: string;
  invalidCode: boolean;
  expiresSeconds: number;
  attemptsRemaining: number;
  resendSeconds: number;
  pending: boolean;
  onCodeChange: (code: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Verification code sent to</p>
        <p className="mt-1 break-all text-sm font-medium text-foreground">{email}</p>
      </div>
      {expiresSeconds === 0 ? (
        <p role="status" className="text-sm text-amber-700 dark:text-amber-300">This code has expired. Request a new code to continue.</p>
      ) : attemptsRemaining === 0 ? (
        <p role="status" className="text-sm text-amber-700 dark:text-amber-300">No attempts remain. Request a new code to continue.</p>
      ) : (
        <>
          <OtpCodeInput id="staff-email-code" value={code} onChange={onCodeChange} disabled={pending} invalid={invalidCode} />
          <p className="text-xs text-muted-foreground">{attemptsRemaining} attempts remaining · Expires in {Math.floor(expiresSeconds / 60)}:{String(expiresSeconds % 60).padStart(2, "0")}</p>
        </>
      )}
      <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:flex-wrap">
        <Button type="button" onClick={onVerify} disabled={pending || code.length !== 6 || attemptsRemaining === 0 || expiresSeconds === 0} className="min-h-10 w-full min-[420px]:w-auto">{pending ? "Checking code…" : "Confirm new email"}</Button>
        <Button type="button" variant="outline" onClick={onResend} disabled={pending || resendSeconds > 0} className="min-h-10 w-full min-[420px]:w-auto">{resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Send a new code"}</Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending} className="min-h-10 w-full min-[420px]:w-auto">Cancel change</Button>
      </div>
    </div>
  );
}
