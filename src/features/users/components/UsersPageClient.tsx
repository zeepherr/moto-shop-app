"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";
import { Button } from "@/components/ui/button";
import { resendAssistedEnrollmentOtpAction } from "@/features/auth/actions/admin-enrollment-verification.action";
import {
  cancelEnrollmentAction,
  resendPasswordSetupLinkAction,
  resendSelfServiceRegistrationLinkAction,
} from "@/features/auth/actions/admin-enrollment-recovery.action";
import { updateUserAccessAction, updateUserRoleAction } from "../actions/user.actions";
import { EnrollmentDialog } from "./EnrollmentDialog";
import type { EnrollmentItem } from "./EnrollmentTable";
import { UserDetailDialog } from "./UserDetailDialog";
import { UserStats } from "./UserStats";
import type { UserItem } from "./UserTable";
import { UserManagementWorkspace } from "./UserManagementWorkspace";

interface Props {
  initialUsers: UserItem[];
  initialEnrollments: EnrollmentItem[];
}

type EnrollmentMethod = "SELF_SERVICE" | "ASSISTED";
type UserView = "people" | "enrollments";
type EnrollmentDefaults = { email: string; role: "MEMBER" | "STAFF" } | null;
type PendingRoleChange = { user: UserItem; role: "STAFF" | "MEMBER" } | null;
type PendingAccessChange = { user: UserItem; isActive: boolean } | null;

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

  const stats = useMemo(
    () => ({
      admin: users.filter((user) => user.role === "ADMIN").length,
      staff: users.filter((user) => user.role === "STAFF").length,
      member: users.filter((user) => user.role === "MEMBER").length,
    }),
    [users],
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

      <UserManagementWorkspace
        view={view}
        onViewChange={setView}
        users={users}
        enrollments={initialEnrollments}
        filteredUsers={filteredUsers}
        filteredEnrollments={filteredEnrollments}
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        accessFilter={accessFilter}
        onAccessFilterChange={setAccessFilter}
        enrollmentStatus={enrollmentStatus}
        onEnrollmentStatusChange={setEnrollmentStatus}
        onClearFilters={clearFilters}
        onViewUser={setSelectedUser}
        onRoleChange={(user, role) => setRoleUser({ user, role })}
        onAccessChange={(user, isActive) => setAccessUser({ user, isActive })}
        onVerifyEnrollment={(item) => router.push(`/admin/users/enrollments/${item.id}/verify`)}
        onResendOtp={(item) => run(() => resendAssistedEnrollmentOtpAction(item.id), "Verification code sent.")}
        onResendRegistrationLink={(item) => run(() => resendSelfServiceRegistrationLinkAction(item.id), "Registration link sent.")}
        onResendPasswordLink={(item) => run(() => resendPasswordSetupLinkAction(item.id), "Password setup link sent.")}
        onCancelEnrollment={setCancelItem}
        onRestartEnrollment={setRestartItem}
        isPending={isPending}
      />

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
