"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OtpMotionScene } from "@/features/auth/components/OtpMotionScene";
import { OtpCodeInput } from "@/features/auth/components/OtpCodeInput";
import {
  resendAssistedEnrollmentOtpAction,
  verifyAssistedEnrollmentOtpAction,
} from "@/features/auth/actions/admin-enrollment-verification.action";

interface AssistedEnrollmentOtpFormProps {
  enrollmentId: number;
  email: string;
}

export function AssistedEnrollmentOtpForm({ enrollmentId, email }: AssistedEnrollmentOtpFormProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);

  const verify = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setInvalid(false);
    startTransition(async () => {
      const result = await verifyAssistedEnrollmentOtpAction({ enrollmentId, code });
      if (!result.success) {
        setInvalid(true);
        toast.error("error" in result ? result.error || "Verification failed." : "Verification failed.");
        return;
      }
      setVerified(true);
      setMessage("Email verified. Sending the customer their setup links…");
      toast.success("message" in result ? result.message || "Email verified." : "Email verified.");
      router.push("/admin/users");
      router.refresh();
    });
  };

  const resend = () => {
    startTransition(async () => {
      setMessage(null);
      const result = await resendAssistedEnrollmentOtpAction(enrollmentId);
      if (!result.success) {
        toast.error("error" in result ? result.error || "Could not send code." : "Could not send code.");
        return;
      }
      setMessage("A new code has been sent to the customer.");
      toast.success("message" in result ? result.message || "Code sent." : "Code sent.");
    });
  };

  return (
    <form className="mx-auto max-w-2xl space-y-5" onSubmit={verify}>
      <OtpMotionScene compact verified={verified} />
      {message ? <p role="status" aria-live="polite" className="text-center text-sm text-success">{message}</p> : null}
      <p className="text-sm leading-6 text-muted-foreground">
        Ask the customer for the six-digit code delivered to <span className="font-medium text-foreground">{email}</span>.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="assisted-otp">Verification code</Label>
        <OtpCodeInput id="assisted-otp" value={code} onChange={(value) => { setCode(value); setInvalid(false); }} disabled={isPending} invalid={invalid} verified={verified} autoFocus />
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={resend} disabled={isPending}>Resend code</Button>
        <Button type="submit" disabled={isPending || code.length !== 6}>{isPending ? "Verifying…" : "Verify and send links"}</Button>
      </div>
    </form>
  );
}
