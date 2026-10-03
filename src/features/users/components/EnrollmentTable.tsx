"use client";

import { MailCheck, RotateCcw, Send, XCircle } from "lucide-react";
import { ActionMenu } from "@/components/management/ActionMenu";

export interface EnrollmentItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "MEMBER" | "STAFF" | "ADMIN";
  method: "SELF_SERVICE" | "ASSISTED";
  status: "APPROVED" | "AWAITING_OTP" | "AWAITING_PASSWORD_SETUP" | "COMPLETED" | "CANCELLED" | "EXPIRED";
  expiresAt: string;
  otpExpiresAt: string | null;
  createdAt: string;
}

interface EnrollmentTableProps {
  enrollments: EnrollmentItem[];
  onVerify: (enrollment: EnrollmentItem) => void;
  onResendOtp: (enrollment: EnrollmentItem) => void;
  onResendPasswordLink: (enrollment: EnrollmentItem) => void;
  onCancel: (enrollment: EnrollmentItem) => void;
  isPending?: boolean;
}

const statusLabel: Record<EnrollmentItem["status"], string> = {
  APPROVED: "Ready to register",
  AWAITING_OTP: "Awaiting OTP",
  AWAITING_PASSWORD_SETUP: "Password setup sent",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export function EnrollmentTable({ enrollments, onVerify, onResendOtp, onResendPasswordLink, onCancel, isPending }: EnrollmentTableProps) {
  if (!enrollments.length) {
    return <div className="py-16 text-center text-sm text-muted-foreground">No active enrollments. Start one when a customer is ready to join.</div>;
  }

  return (
    <table className="w-full min-w-[760px] text-sm">
      <thead>
        <tr className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <th className="px-4 py-3 font-medium">Person</th>
          <th className="px-4 py-3 font-medium">Route</th>
          <th className="px-4 py-3 font-medium">Role</th>
          <th className="px-4 py-3 font-medium">Status</th>
          <th className="px-4 py-3 font-medium">Expires</th>
          <th className="w-16 px-4 py-3"><span className="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/40">
        {enrollments.map((enrollment) => {
          const name = `${enrollment.firstName} ${enrollment.lastName}`.trim();
          const items = [
            ...(enrollment.status === "AWAITING_OTP"
              ? [{ label: "Verify customer code", icon: MailCheck, onSelect: () => onVerify(enrollment) }, { label: "Resend verification code", icon: RotateCcw, onSelect: () => onResendOtp(enrollment) }]
              : []),
            ...(enrollment.status === "AWAITING_PASSWORD_SETUP"
              ? [{ label: "Resend password link", icon: Send, onSelect: () => onResendPasswordLink(enrollment) }]
              : []),
            { label: "Cancel enrollment", icon: XCircle, tone: "danger" as const, onSelect: () => onCancel(enrollment) },
          ];
          return (
            <tr className="transition-colors hover:bg-muted/30" key={enrollment.id}>
              <td className="px-4 py-3.5"><p className="font-semibold text-foreground">{name}</p><p className="text-xs text-muted-foreground">{enrollment.email}</p></td>
              <td className="px-4 py-3.5 text-muted-foreground">{enrollment.method === "ASSISTED" ? "In person" : "Self-registration"}</td>
              <td className="px-4 py-3.5"><span className="rounded-full border border-border/60 bg-muted/50 px-2 py-1 text-xs font-medium text-foreground">{enrollment.role === "STAFF" ? "Staff" : "Member"}</span></td>
              <td className="px-4 py-3.5"><span className="text-xs font-medium text-foreground">{statusLabel[enrollment.status]}</span></td>
              <td className="px-4 py-3.5 text-xs tabular-nums text-muted-foreground">{new Date(enrollment.expiresAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
              <td className="px-4 py-3.5 text-right"><ActionMenu label={name} disabled={isPending} items={items} /></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
