"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resendAssistedEnrollmentOtpAction, verifyAssistedEnrollmentOtpAction } from "@/features/auth/actions/admin-enrollment.action";
import type { EnrollmentItem } from "./EnrollmentTable";

interface AssistedVerificationDialogProps {
  enrollment: EnrollmentItem | null;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function AssistedVerificationDialog({ enrollment, onOpenChange, onComplete }: AssistedVerificationDialogProps) {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();

  const verify = () => {
    if (!enrollment) return;
    startTransition(async () => {
      const result = await verifyAssistedEnrollmentOtpAction({ enrollmentId: enrollment.id, code });
      if (!result.success) {
        toast.error("error" in result ? result.error || "Verification failed." : "Verification failed.");
        return;
      }
      toast.success("message" in result ? result.message || "Email verified." : "Email verified.");
      setCode("");
      onOpenChange(false);
      onComplete();
    });
  };

  const resend = () => {
    if (!enrollment) return;
    startTransition(async () => {
      const result = await resendAssistedEnrollmentOtpAction(enrollment.id);
      if (result.success) {
        toast.success("message" in result ? result.message || "Code sent." : "Code sent.");
      } else {
        toast.error("error" in result ? result.error || "Could not send code." : "Could not send code.");
      }
    });
  };

  return (
    <Dialog open={enrollment !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm customer verification</DialogTitle>
          <DialogDescription>Enter the six-digit code shared by {enrollment?.firstName || "the customer"}. A password setup link will be emailed only after it is correct.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="assisted-otp">Verification code</Label>
          <Input id="assisted-otp" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} className="h-12 text-center font-mono text-lg tracking-[0.35em]" />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={resend} disabled={isPending}>Resend code</Button>
          <Button type="button" onClick={verify} disabled={isPending || code.length !== 6}>{isPending ? "Verifying…" : "Verify and send link"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
