"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { DockedTableCard } from "@/components/management/DockedTableCard";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { resendAssistedEnrollmentOtpAction } from "@/features/auth/actions/admin-enrollment-verification.action";
import {
  cancelEnrollmentAction,
  resendPasswordSetupLinkAction,
  resendSelfServiceRegistrationLinkAction,
} from "@/features/auth/actions/admin-enrollment-recovery.action";
import { updateUserAccessAction, updateUserRoleAction } from "../actions/user.actions";
import { EnrollmentDialog } from "./EnrollmentDialog";
import { EnrollmentTable, type EnrollmentItem } from "./EnrollmentTable";
import { UserDetailDialog } from "./UserDetailDialog";
import { UserStats } from "./UserStats";
import { UserTable, type UserItem } from "./UserTable";

interface Props {
  initialUsers: UserItem[];
  initialEnrollments: EnrollmentItem[];
}

type EnrollmentMethod = "SELF_SERVICE" | "ASSISTED";
type UserView = "people" | "enrollments";
type EnrollmentDefaults = { email: string; role: "MEMBER" | "STAFF" } | null;
type PendingRoleChange = { user: UserItem; role: "STAFF" | "MEMBER" } | null;
type PendingAccessChange = { user: UserItem; isActive: boolean } | null;

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
          <button
            type="button"
            onClick={() => onSelectStatus("AWAITING_OTP")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary"
          >
            <MailCheck className="size-3.5" />
            {codeCount} code{codeCount === 1 ? "" : "s"} to verify
          </button>
        )}
        {setupCount > 0 && (
          <button
            type="button"
            onClick={() => onSelectStatus("AWAITING_PASSWORD_SETUP")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground"
          >
            <CheckCircle2 className="size-3.5" />
            {setupCount} setup pending
          </button>
        )}
        {deliveryCount > 0 && (
          <button
            type="button"
            onClick={onShowDeliveryIssues}
            className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive"
          >
            <AlertTriangle className="size-3.5" />
            {deliveryCount} delivery issue{deliveryCount === 1 ? "" : "s"}
          </button>
        )}
        {codeCount === 0 && setupCount === 0 && deliveryCount === 0 && (
          <span className="text-xs text-muted-foreground">
            No enrollment work needs attention.
          </span>
        )}
      </div>
    </section>
  );
}

interface UserViewTabsProps {
  view: UserView;
  enrollmentCount: number;
  onChange: (view: UserView) => void;
}

function UserViewTabs({ view, enrollmentCount, onChange }: UserViewTabsProps) {
  const tabs: Array<{ value: UserView; label: string }> = [
    { value: "people", label: "People" },
    { value: "enrollments", label: `Enrollment queue (${enrollmentCount})` },
  ];

  return (
    <div
      className="flex gap-1 border-b border-border/60"
      role="tablist"
      aria-label="User management views"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={view === tab.value}
          onClick={() => onChange(tab.value)}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            view === tab.value
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function UsersPageClient({ initialUsers, initialEnrollments }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [view, setView] = useState<UserView>("people");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [accessFilter, setAccessFilter] = useState("all");
  const [enrollmentStatus, setEnrollmentStatus] = useState("ALL");
  const [method, setMethod] = useState<EnrollmentMethod | null>(null);
  const [enrollmentDefaults, setEnrollmentDefaults] = useState<EnrollmentDefaults>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [roleUser, setRoleUser] = useState<PendingRoleChange>(null);
  const [accessUser, setAccessUser] = useState<PendingAccessChange>(null);
  const [cancelItem, setCancelItem] = useState<EnrollmentItem | null>(null);
  const [restartItem, setRestartItem] = useState<EnrollmentItem | null>(null);
  const [isPending, setIsPending] = useState(false);

  const counts = useMemo(
    () => ({
      all: users.length,
      active: users.filter((user) => user.isActive).length,
      inactive: users.filter((user) => !user.isActive).length,
    }),
    [users],
  );
  const stats = useMemo(
    () => ({
      admin: users.filter((user) => user.role === "ADMIN").length,
      staff: users.filter((user) => user.role === "STAFF").length,
      member: users.filter((user) => user.role === "MEMBER").length,
    }),
    [users],
  );
  const attention = useMemo(
    () => ({
      codes: initialEnrollments.filter((item) => item.status === "AWAITING_OTP").length,
      setup: initialEnrollments.filter((item) => item.status === "AWAITING_PASSWORD_SETUP").length,
      delivery: initialEnrollments.filter((item) =>
        item.lastEvent?.action.endsWith("DELIVERY_FAILED"),
      ).length,
    }),
    [initialEnrollments],
  );
  const searchTerm = search.trim().toLowerCase();
  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch =
          !searchTerm ||
          [user.firstName, user.lastName, user.email, user.phone].some((value) =>
            value?.toLowerCase().includes(searchTerm),
          );
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
        const matchesAccess =
          accessFilter === "all" ||
          (accessFilter === "active" ? user.isActive : !user.isActive);

        return matchesSearch && matchesRole && matchesAccess;
      }),
    [users, searchTerm, roleFilter, accessFilter],
  );
  const filteredEnrollments = useMemo(
    () =>
      initialEnrollments.filter((item) => {
        const fullName = `${item.firstName} ${item.lastName} ${item.email}`.toLowerCase();
        const matchesSearch = !searchTerm || fullName.includes(searchTerm);
        const matchesStatus = enrollmentStatus === "ALL" || item.status === enrollmentStatus;

        return matchesSearch && matchesStatus;
      }),
    [initialEnrollments, searchTerm, enrollmentStatus],
  );

  const refresh = () => router.refresh();
  const clearFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setAccessFilter("all");
    setEnrollmentStatus("ALL");
  };
  const hasFilters =
    Boolean(search) || roleFilter !== "ALL" || accessFilter !== "all" || enrollmentStatus !== "ALL";

  const withPending = async <T,>(work: () => Promise<T>): Promise<T> => {
    setIsPending(true);
    try {
      return await work();
    } finally {
      setIsPending(false);
    }
  };

  const run = async (
    work: () => Promise<{ success: boolean; message?: string; error?: string }>,
    successMessage: string,
  ) => {
    const result = await withPending(work);

    if (!result.success) {
      toast.error(result.error || "Unable to complete this action.");
      return;
    }

    toast.success(result.message || successMessage);
    refresh();
  };

  const updateRole = async () => {
    if (!roleUser) return;

    const result = await withPending(() =>
      updateUserRoleAction(roleUser.user.id, roleUser.role),
    );

    if (!result.success) {
      toast.error(result.error || "Unable to update role.");
      return;
    }

    setUsers((items) =>
      items.map((item) =>
        item.id === roleUser.user.id ? { ...item, role: roleUser.role } : item,
      ),
    );
    setRoleUser(null);
    toast.success("Role updated. Existing sessions were revoked.");
  };

  const updateAccess = async () => {
    if (!accessUser) return;

    const result = await withPending(() =>
      updateUserAccessAction(accessUser.user.id, accessUser.isActive),
    );

    if (!result.success) {
      toast.error(result.error || "Unable to change account access.");
      return;
    }

    setUsers((items) =>
      items.map((item) =>
        item.id === accessUser.user.id ? { ...item, isActive: accessUser.isActive } : item,
      ),
    );
    setAccessUser(null);
    toast.success(
      accessUser.isActive
        ? "Access restored. Existing sessions were revoked."
        : "Access paused and active sessions were revoked.",
    );
  };

  const restart = async () => {
    if (!restartItem) return;
    const item = restartItem;

    if (item.status !== "CANCELLED" && item.status !== "EXPIRED") {
      const result = await withPending(() => cancelEnrollmentAction(item.id));
      if (!result.success) {
        toast.error(result.error || "Unable to restart enrollment.");
        return;
      }
    }

    setRestartItem(null);
    setEnrollmentDefaults({
      email: item.email,
      role: item.role === "STAFF" ? "STAFF" : "MEMBER",
    });
    setMethod(item.method);
    refresh();
  };

  const tableFilter = view === "people" ? roleFilter : enrollmentStatus;
  const filteredCount = view === "people" ? filteredUsers.length : filteredEnrollments.length;
  const totalCount = view === "people" ? users.length : initialEnrollments.length;

  return (
    <ManagementLayout className="!space-y-4 sm:!space-y-6">
      <PageHeader
        compactOnMobile
        title="People"
        description="Create verified shop accounts, keep access current, and resolve enrollment work before customers leave the counter."
        count={users.length}
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setEnrollmentDefaults(null);
            setMethod("SELF_SERVICE");
          }}
        >
          Send registration link
        </Button>
        <Button
          type="button"
          onClick={() => {
            setEnrollmentDefaults(null);
            setMethod("ASSISTED");
          }}
        >
          Register at counter
        </Button>
      </PageHeader>

      <UserStats
        total={users.length}
        adminCount={stats.admin}
        staffCount={stats.staff}
        memberCount={stats.member}
      />

      <EnrollmentAttention
        codeCount={attention.codes}
        setupCount={attention.setup}
        deliveryCount={attention.delivery}
        onSelectStatus={(status) => {
          setView("enrollments");
          setEnrollmentStatus(status);
        }}
        onShowDeliveryIssues={() => setView("enrollments")}
      />

      <UserViewTabs
        view={view}
        enrollmentCount={initialEnrollments.length}
        onChange={setView}
      />

      <DockedTableCard
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          view === "people"
            ? "Search people by name, email, or phone..."
            : "Search enrollments..."
        }
        status={view === "people" ? accessFilter : undefined}
        onStatusChange={view === "people" ? setAccessFilter : undefined}
        statusCounts={counts}
        filterSlot={
          <Select
            value={tableFilter}
            onValueChange={(selected) =>
              view === "people" ? setRoleFilter(selected) : setEnrollmentStatus(selected)
            }
            className="h-9.5 rounded-xl border border-input/80 bg-background/50 px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary sm:w-48"
            options={
              view === "people"
                ? [
                    { value: "ALL", label: "All roles" },
                    { value: "ADMIN", label: "Administrators" },
                    { value: "STAFF", label: "Staff" },
                    { value: "MEMBER", label: "Members" },
                  ]
                : [
                    { value: "ALL", label: "All enrollment states" },
                    { value: "APPROVED", label: "Ready to register" },
                    { value: "AWAITING_OTP", label: "Awaiting code" },
                    { value: "AWAITING_PASSWORD_SETUP", label: "Password setup sent" },
                  ]
            }
          />
        }
        hasActiveFilters={hasFilters}
        onClearFilters={clearFilters}
        totalFiltered={filteredCount}
        totalAll={totalCount}
        entityName={view === "people" ? "people" : "enrollments"}
      >
        {view === "people" ? (
          <UserTable
            users={filteredUsers}
            onView={setSelectedUser}
            onRoleChange={(user, role) => setRoleUser({ user, role })}
            onAccessChange={(user, isActive) => setAccessUser({ user, isActive })}
            isPending={isPending}
          />
        ) : (
          <EnrollmentTable
            enrollments={filteredEnrollments}
            isPending={isPending}
            onVerify={(item) => router.push(`/admin/users/enrollments/${item.id}/verify`)}
            onResendOtp={(item) =>
              run(() => resendAssistedEnrollmentOtpAction(item.id), "Verification code sent.")
            }
            onResendRegistrationLink={(item) =>
              run(() => resendSelfServiceRegistrationLinkAction(item.id), "Registration link sent.")
            }
            onResendPasswordLink={(item) =>
              run(() => resendPasswordSetupLinkAction(item.id), "Password setup link sent.")
            }
            onCancel={setCancelItem}
            onRestart={setRestartItem}
          />
        )}
      </DockedTableCard>

      <EnrollmentDialog
        key={`${method ?? "closed"}:${enrollmentDefaults?.email ?? ""}`}
        method={method}
        defaults={enrollmentDefaults}
        onOpenChange={(open) => {
          if (!open) {
            setMethod(null);
            setEnrollmentDefaults(null);
          }
        }}
        onCreated={refresh}
        onConflict={() => {
          setView("enrollments");
          refresh();
        }}
      />
      <UserDetailDialog user={selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)} />

      <ConfirmActionDialog
        open={roleUser !== null}
        onOpenChange={(open) => !open && setRoleUser(null)}
        title={`Change role to ${roleUser?.role === "STAFF" ? "Staff" : "Member"}?`}
        description={
          roleUser
            ? `Change ${roleUser.user.firstName} ${roleUser.user.lastName}'s role. Their active sessions will be revoked.`
            : ""
        }
        confirmLabel="Change role"
        variant="default"
        isPending={isPending}
        onConfirm={updateRole}
      />
      <ConfirmActionDialog
        open={accessUser !== null}
        onOpenChange={(open) => !open && setAccessUser(null)}
        title={accessUser?.isActive ? "Restore account access?" : "Deactivate this account?"}
        description={
          accessUser
            ? `${accessUser.user.firstName} ${accessUser.user.lastName}'s historical records stay available. Their active sessions will be revoked.`
            : ""
        }
        confirmLabel={accessUser?.isActive ? "Restore access" : "Deactivate"}
        variant={accessUser?.isActive ? "default" : "destructive"}
        isPending={isPending}
        onConfirm={updateAccess}
      />
      <ConfirmActionDialog
        open={cancelItem !== null}
        onOpenChange={(open) => !open && setCancelItem(null)}
        title="Cancel this enrollment?"
        description={
          cancelItem
            ? `${cancelItem.email} will no longer be able to continue this enrollment. You can start a new one later.`
            : ""
        }
        confirmLabel="Cancel enrollment"
        variant="destructive"
        isPending={isPending}
        onConfirm={async () => {
          if (!cancelItem) return;
          await run(() => cancelEnrollmentAction(cancelItem.id), "Enrollment cancelled.");
          setCancelItem(null);
        }}
      />
      <ConfirmActionDialog
        open={restartItem !== null}
        onOpenChange={(open) => !open && setRestartItem(null)}
        title="Cancel and restart enrollment?"
        description={
          restartItem
            ? `The current ${restartItem.method === "ASSISTED" ? "counter" : "self-service"} flow for ${restartItem.email} will be cancelled before a fresh flow is started.`
            : ""
        }
        confirmLabel="Restart enrollment"
        variant="destructive"
        isPending={isPending}
        onConfirm={restart}
      />
    </ManagementLayout>
  );
}
