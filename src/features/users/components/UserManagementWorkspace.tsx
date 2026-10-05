"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, MailCheck } from "lucide-react";
import { DockedTableCard } from "@/components/management/DockedTableCard";
import { Select } from "@/components/ui/select";
import { EnrollmentTable, type EnrollmentItem } from "./EnrollmentTable";
import { UserTable, type UserItem } from "./UserTable";

type UserView = "people" | "enrollments";

interface UserManagementWorkspaceProps {
  view: UserView;
  onViewChange: (view: UserView) => void;
  users: UserItem[];
  enrollments: EnrollmentItem[];
  filteredUsers: UserItem[];
  filteredEnrollments: EnrollmentItem[];
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  accessFilter: string;
  onAccessFilterChange: (value: string) => void;
  enrollmentStatus: string;
  onEnrollmentStatusChange: (value: string) => void;
  onClearFilters: () => void;
  onViewUser: (user: UserItem) => void;
  onRoleChange: (user: UserItem, role: "STAFF" | "MEMBER") => void;
  onAccessChange: (user: UserItem, isActive: boolean) => void;
  onVerifyEnrollment: (item: EnrollmentItem) => void;
  onResendOtp: (item: EnrollmentItem) => void;
  onResendRegistrationLink: (item: EnrollmentItem) => void;
  onResendPasswordLink: (item: EnrollmentItem) => void;
  onCancelEnrollment: (item: EnrollmentItem) => void;
  onRestartEnrollment: (item: EnrollmentItem) => void;
  isPending: boolean;
}

interface EnrollmentAttentionProps {
  codeCount: number;
  setupCount: number;
  deliveryCount: number;
  onSelectStatus: (status: EnrollmentItem["status"]) => void;
  onShowDeliveryIssues: () => void;
}

function EnrollmentAttention({
  codeCount,
  setupCount,
  deliveryCount,
  onSelectStatus,
  onShowDeliveryIssues,
}: EnrollmentAttentionProps) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-foreground">Enrollment queue</p>
        <p className="text-xs text-muted-foreground">
          Resolve the next customer action without losing the account context.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {codeCount > 0 && (
          <button type="button" onClick={() => onSelectStatus("AWAITING_OTP")} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary">
            <MailCheck className="size-3.5" />
            {codeCount} code{codeCount === 1 ? "" : "s"} to verify
          </button>
        )}
        {setupCount > 0 && (
          <button type="button" onClick={() => onSelectStatus("AWAITING_PASSWORD_SETUP")} className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground">
            <CheckCircle2 className="size-3.5" />
            {setupCount} setup pending
          </button>
        )}
        {deliveryCount > 0 && (
          <button type="button" onClick={onShowDeliveryIssues} className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive">
            <AlertTriangle className="size-3.5" />
            {deliveryCount} delivery issue{deliveryCount === 1 ? "" : "s"}
          </button>
        )}
        {codeCount === 0 && setupCount === 0 && deliveryCount === 0 && (
          <span className="text-xs text-muted-foreground">No enrollment work needs attention.</span>
        )}
      </div>
    </section>
  );
}

function UserViewTabs({
  view,
  enrollmentCount,
  onChange,
}: {
  view: UserView;
  enrollmentCount: number;
  onChange: (view: UserView) => void;
}) {
  const tabs: Array<{ value: UserView; label: string }> = [
    { value: "people", label: "People" },
    { value: "enrollments", label: `Enrollment queue (${enrollmentCount})` },
  ];

  return (
    <div className="flex gap-1 border-b border-border/60" role="tablist" aria-label="User management views">
      {tabs.map((tab) => (
        <button key={tab.value} type="button" role="tab" aria-selected={view === tab.value} onClick={() => onChange(tab.value)} className={`border-b-2 px-3 py-2 text-sm font-medium ${view === tab.value ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function UserManagementWorkspace(props: UserManagementWorkspaceProps) {
  const {
    view, onViewChange, users, enrollments, filteredUsers, filteredEnrollments,
    search, onSearchChange, roleFilter, onRoleFilterChange, accessFilter,
    onAccessFilterChange, enrollmentStatus, onEnrollmentStatusChange, onClearFilters,
    onViewUser, onRoleChange, onAccessChange, onVerifyEnrollment, onResendOtp,
    onResendRegistrationLink, onResendPasswordLink, onCancelEnrollment,
    onRestartEnrollment, isPending,
  } = props;

  const counts = useMemo(() => ({
    all: users.length,
    active: users.filter((user) => user.isActive).length,
    inactive: users.filter((user) => !user.isActive).length,
  }), [users]);
  const attention = useMemo(() => ({
    codes: enrollments.filter((item) => item.status === "AWAITING_OTP").length,
    setup: enrollments.filter((item) => item.status === "AWAITING_PASSWORD_SETUP").length,
    delivery: enrollments.filter((item) => item.lastEvent?.action.endsWith("DELIVERY_FAILED")).length,
  }), [enrollments]);
  const tableFilter = view === "people" ? roleFilter : enrollmentStatus;
  const filteredCount = view === "people" ? filteredUsers.length : filteredEnrollments.length;
  const totalCount = view === "people" ? users.length : enrollments.length;
  const hasFilters = Boolean(search) || roleFilter !== "ALL" || accessFilter !== "all" || enrollmentStatus !== "ALL";

  return (
    <>
      <EnrollmentAttention
        codeCount={attention.codes}
        setupCount={attention.setup}
        deliveryCount={attention.delivery}
        onSelectStatus={(status) => { onViewChange("enrollments"); onEnrollmentStatusChange(status); }}
        onShowDeliveryIssues={() => onViewChange("enrollments")}
      />
      <UserViewTabs view={view} enrollmentCount={enrollments.length} onChange={onViewChange} />
      <DockedTableCard
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={view === "people" ? "Search people by name, email, or phone..." : "Search enrollments..."}
        status={view === "people" ? accessFilter : undefined}
        onStatusChange={view === "people" ? onAccessFilterChange : undefined}
        statusCounts={counts}
        filterSlot={
          <Select
            value={tableFilter}
            onValueChange={(selected) => view === "people" ? onRoleFilterChange(selected) : onEnrollmentStatusChange(selected)}
            className="h-9.5 rounded-xl border border-input/80 bg-background/50 px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary sm:w-48"
            options={view === "people" ? [
              { value: "ALL", label: "All roles" },
              { value: "ADMIN", label: "Administrators" },
              { value: "STAFF", label: "Staff" },
              { value: "MEMBER", label: "Members" },
            ] : [
              { value: "ALL", label: "All enrollment states" },
              { value: "APPROVED", label: "Ready to register" },
              { value: "AWAITING_OTP", label: "Awaiting code" },
              { value: "AWAITING_PASSWORD_SETUP", label: "Password setup sent" },
            ]}
          />
        }
        hasActiveFilters={hasFilters}
        onClearFilters={onClearFilters}
        totalFiltered={filteredCount}
        totalAll={totalCount}
        entityName={view === "people" ? "people" : "enrollments"}
      >
        {view === "people" ? (
          <UserTable users={filteredUsers} onView={onViewUser} onRoleChange={onRoleChange} onAccessChange={onAccessChange} isPending={isPending} />
        ) : (
          <EnrollmentTable
            enrollments={filteredEnrollments}
            isPending={isPending}
            onVerify={onVerifyEnrollment}
            onResendOtp={onResendOtp}
            onResendRegistrationLink={onResendRegistrationLink}
            onResendPasswordLink={onResendPasswordLink}
            onCancel={onCancelEnrollment}
            onRestart={onRestartEnrollment}
          />
        )}
      </DockedTableCard>
    </>
  );
}
