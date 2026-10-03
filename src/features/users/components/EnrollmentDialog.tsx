"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEnrollmentAction } from "@/features/auth/actions/admin-enrollment.action";

type EnrollmentMethod = "SELF_SERVICE" | "ASSISTED";

interface EnrollmentDialogProps {
  method: EnrollmentMethod | null;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  defaults?: { email: string; role: "MEMBER" | "STAFF" } | null;
  onConflict?: () => void;
}

export function EnrollmentDialog({ method, onOpenChange, onCreated, defaults, onConflict }: EnrollmentDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(() => defaults ?? { email: "", role: "MEMBER" as "MEMBER" | "STAFF" });
  const isAssisted = method === "ASSISTED";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!method) return;

    startTransition(async () => {
      const result = await createEnrollmentAction({ ...form, method });
      if (!result.success) {
        toast.error(result.error || "Unable to start enrollment.");
        if ("data" in result && result.data) {
          onOpenChange(false);
          onConflict?.();
        }
        return;
      }
      toast.success(result.message || "Enrollment created.");
      setForm({ email: "", role: "MEMBER" });
      onOpenChange(false);
      if (isAssisted && "data" in result && result.data) {
        router.push(`/admin/users/enrollments/${result.data.id}/verify`);
        return;
      }
      onCreated();
    });
  };

  return (
    <Dialog open={method !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isAssisted ? "Register customer in person" : "Approve self-registration"}</DialogTitle>
          <DialogDescription>
            {isAssisted
              ? "A verification code will be emailed to the customer. Confirm it here before sending their password setup link."
              : "A registration link to /register will be emailed to the customer and remains valid for 24 hours."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label htmlFor="enrollment-email">Email address</Label>
            <Input id="enrollment-email" type="email" required value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enrollment-role">Account role</Label>
            <select id="enrollment-role" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as "MEMBER" | "STAFF" }))} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary">
              <option value="MEMBER">Member</option>
              <option value="STAFF">Staff</option>
            </select>
            <p className="text-xs text-muted-foreground">The account starts as “New {form.role === "STAFF" ? "Staff" : "Member"}”. The person can update this later in their profile.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : isAssisted ? "Send invitation code" : "Send registration link"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
