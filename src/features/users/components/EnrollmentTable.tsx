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
  lastEvent: { action: string; createdAt: string } | null;
}

interface EnrollmentTableProps {
  enrollments: EnrollmentItem[];
  onVerify: (enrollment: EnrollmentItem) => void;
  onResendOtp: (enrollment: EnrollmentItem) => void;
  onResendRegistrationLink: (enrollment: EnrollmentItem) => void;
  onResendPasswordLink: (enrollment: EnrollmentItem) => void;
  onCancel: (enrollment: EnrollmentItem) => void;
  onRestart: (enrollment: EnrollmentItem) => void;
  isPending?: boolean;
}

const statusLabel: Record<EnrollmentItem["status"], string> = {
  APPROVED: "Ready to register",
  AWAITING_OTP: "Awaiting code",
  AWAITING_PASSWORD_SETUP: "Password setup sent",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

const deliveryLabel = (event: EnrollmentItem["lastEvent"]) => {
  if (!event) return "No delivery recorded";
  if (event.action.endsWith("DELIVERY_FAILED")) return "Delivery needs retry";
  if (event.action.includes("LINK_SENT")) return "Email delivered";
  if (event.action === "ENROLLMENT_OTP_SENT") return "Code delivered";
  return "Updated";
};

export function EnrollmentTable({ enrollments, onVerify, onResendOtp, onResendRegistrationLink, onResendPasswordLink, onCancel, onRestart, isPending }: EnrollmentTableProps) {
  if (!enrollments.length) {
    return <div className="py-16 text-center text-sm text-muted-foreground">No active enrollments. Start one when someone is ready to join the shop.</div>;
  }

  return (
    <>
    <div className="space-y-3 p-3 md:hidden">
      {enrollments.map((enrollment) => {
        const name = `${enrollment.firstName} ${enrollment.lastName}`.trim();
        const canCancel = enrollment.status !== "CANCELLED" && enrollment.status !== "EXPIRED";
        const actions = [
          ...(enrollment.status === "APPROVED" ? [{ label: "Resend registration link", icon: Send, onSelect: () => onResendRegistrationLink(enrollment) }] : []),
          ...(enrollment.status === "AWAITING_OTP" ? [{ label: "Verify customer code", icon: MailCheck, onSelect: () => onVerify(enrollment) }, { label: "Resend verification code", icon: RotateCcw, onSelect: () => onResendOtp(enrollment) }] : []),
          ...(enrollment.status === "AWAITING_PASSWORD_SETUP" ? [{ label: "Resend password link", icon: Send, onSelect: () => onResendPasswordLink(enrollment) }] : []),
          ...(canCancel ? [{ label: "Cancel enrollment", icon: XCircle, tone: "danger" as const, separatorBefore: true, onSelect: () => onCancel(enrollment) }] : []),
          { label: "Cancel and restart", icon: RotateCcw, separatorBefore: true, onSelect: () => onRestart(enrollment) },
        ];
        const deliveryFailed = enrollment.lastEvent?.action.endsWith("DELIVERY_FAILED") ?? false;
        return <article key={enrollment.id} className="rounded-xl border border-border/70 bg-background p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{name}</p><p className="truncate text-xs text-muted-foreground">{enrollment.email}</p></div>
            <div className="[&>button]:size-11 [&>button]:rounded-xl"><ActionMenu label={name} disabled={isPending} items={actions} /></div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">{statusLabel[enrollment.status]}</span>
            <span className="text-xs text-muted-foreground">{enrollment.role === "STAFF" ? "Staff" : "Member"}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border/60 pt-3 text-xs">
            <div><p className="text-muted-foreground">Method</p><p className="mt-1 font-medium text-foreground">{enrollment.method === "ASSISTED" ? "At the counter" : "Self-service"}</p></div>
            <div><p className="text-muted-foreground">Expires</p><p className="mt-1 font-medium text-foreground">{new Date(enrollment.expiresAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p></div>
          </div>
          <p className={`mt-3 text-xs ${deliveryFailed ? "font-medium text-destructive" : "text-muted-foreground"}`}>{deliveryLabel(enrollment.lastEvent)}{enrollment.lastEvent ? ` · ${new Date(enrollment.lastEvent.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}` : ""}</p>
        </article>;
      })}
    </div>
    <div className="hidden overflow-x-auto md:block">
    <table className="w-full min-w-[900px] text-sm">
      <thead><tr className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
        <th className="px-4 py-3 font-medium">Person</th><th className="px-4 py-3 font-medium">Method</th><th className="px-4 py-3 font-medium">Next step</th><th className="px-4 py-3 font-medium">Delivery</th><th className="px-4 py-3 font-medium">Expires</th><th className="w-16 px-4 py-3"><span className="sr-only">Actions</span></th>
      </tr></thead>
      <tbody className="divide-y divide-border/40">
        {enrollments.map((enrollment) => {
          const name = `${enrollment.firstName} ${enrollment.lastName}`.trim();
          const canCancel = enrollment.status !== "CANCELLED" && enrollment.status !== "EXPIRED";
          const actions = [
            ...(enrollment.status === "APPROVED" ? [{ label: "Resend registration link", icon: Send, onSelect: () => onResendRegistrationLink(enrollment) }] : []),
            ...(enrollment.status === "AWAITING_OTP" ? [{ label: "Verify customer code", icon: MailCheck, onSelect: () => onVerify(enrollment) }, { label: "Resend verification code", icon: RotateCcw, onSelect: () => onResendOtp(enrollment) }] : []),
            ...(enrollment.status === "AWAITING_PASSWORD_SETUP" ? [{ label: "Resend password link", icon: Send, onSelect: () => onResendPasswordLink(enrollment) }] : []),
            ...(canCancel ? [{ label: "Cancel enrollment", icon: XCircle, tone: "danger" as const, separatorBefore: true, onSelect: () => onCancel(enrollment) }] : []),
            { label: "Cancel and restart", icon: RotateCcw, separatorBefore: true, onSelect: () => onRestart(enrollment) },
          ];
          return <tr className="transition-colors hover:bg-muted/30" key={enrollment.id}>
            <td className="px-4 py-3.5"><p className="font-semibold text-foreground">{name}</p><p className="text-xs text-muted-foreground">{enrollment.email}</p></td>
            <td className="px-4 py-3.5"><p className="text-sm text-foreground">{enrollment.method === "ASSISTED" ? "At the counter" : "Self-service"}</p><p className="text-xs text-muted-foreground">{enrollment.role === "STAFF" ? "Staff" : "Member"}</p></td>
            <td className="px-4 py-3.5"><span className="inline-flex rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">{statusLabel[enrollment.status]}</span></td>
            <td className="px-4 py-3.5"><p className={enrollment.lastEvent?.action.endsWith("DELIVERY_FAILED") ? "text-sm font-medium text-destructive" : "text-sm text-foreground"}>{deliveryLabel(enrollment.lastEvent)}</p><p className="text-xs text-muted-foreground">{enrollment.lastEvent ? new Date(enrollment.lastEvent.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : ""}</p></td>
            <td className="px-4 py-3.5 text-xs tabular-nums text-muted-foreground">{new Date(enrollment.expiresAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
            <td className="px-4 py-3.5 text-right"><ActionMenu label={name} disabled={isPending} items={actions} /></td>
          </tr>;
        })}
      </tbody>
    </table>
    </div>
    </>
  );
}
