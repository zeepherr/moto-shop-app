"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resendAssistedEnrollmentOtpAction,
  verifyAssistedEnrollmentOtpAction,
} from "@/features/auth/actions/admin-enrollment.action";

interface AssistedEnrollmentOtpFormProps {
  enrollmentId: number;
  email: string;
}

export function AssistedEnrollmentOtpForm({ enrollmentId, email }: AssistedEnrollmentOtpFormProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();

  const verify = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await verifyAssistedEnrollmentOtpAction({ enrollmentId, code });
      if (!result.success) {
        toast.error("error" in result ? result.error || "Verification failed." : "Verification failed.");
        return;
      }
      toast.success("message" in result ? result.message || "Email verified." : "Email verified.");
      router.push("/admin/users");
      router.refresh();
    });
  };

  const resend = () => {
    startTransition(async () => {
      const result = await resendAssistedEnrollmentOtpAction(enrollmentId);
      if (!result.success) {
        toast.error("error" in result ? result.error || "Could not send code." : "Could not send code.");
        return;
      }
      toast.success("message" in result ? result.message || "Code sent." : "Code sent.");
    });
  };

  return (
    <form className="space-y-5" onSubmit={verify}>
      <p className="text-sm leading-6 text-muted-foreground">
        Ask the customer for the six-digit code delivered to <span className="font-medium text-foreground">{email}</span>.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="assisted-otp">Verification code</Label>
        <Input id="assisted-otp" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} className="h-12 text-center font-mono text-lg tracking-[0.35em]" autoFocus />
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={resend} disabled={isPending}>Resend code</Button>
        <Button type="submit" disabled={isPending || code.length !== 6}>{isPending ? "Verifying…" : "Verify and send links"}</Button>
      </div>
    </form>
  );
}
