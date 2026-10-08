"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StaffEmailEditor({
  email,
  savedEmail,
  resendSeconds,
  pending,
  onEmailChange,
  onRequestCode,
  onCancel,
}: {
  email: string;
  savedEmail: string;
  resendSeconds: number;
  pending: boolean;
  onEmailChange: (email: string) => void;
  onRequestCode: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      <div>
        <Label htmlFor="staff-new-email">New email</Label>
        <Input id="staff-new-email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => onEmailChange(event.target.value)} disabled={pending} className="mt-2 min-h-11" />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">Your current sign-in email stays active until you verify the new address.</p>
      <div className="flex flex-col gap-2 min-[420px]:flex-row">
        <Button type="button" onClick={onRequestCode} disabled={pending || resendSeconds > 0 || !email.trim() || email.trim().toLowerCase() === savedEmail.toLowerCase()} className="min-h-10 w-full min-[420px]:w-auto">
          {pending ? "Sending code…" : resendSeconds > 0 ? `Try again in ${resendSeconds}s` : "Send verification code"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending} className="min-h-10 w-full min-[420px]:w-auto">Cancel</Button>
      </div>
    </div>
  );
}
