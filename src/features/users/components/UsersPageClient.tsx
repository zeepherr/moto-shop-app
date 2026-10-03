"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";
import { DockedTableCard } from "@/components/management/DockedTableCard";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { cancelEnrollmentAction, resendAssistedEnrollmentOtpAction, resendPasswordSetupLinkAction } from "@/features/auth/actions/admin-enrollment.action";
import { UserStats } from "./UserStats";
import { UserTable, type UserItem } from "./UserTable";
import { EnrollmentDialog } from "./EnrollmentDialog";
import { EnrollmentTable, type EnrollmentItem } from "./EnrollmentTable";
import { updateUserRoleAction } from "../actions/user.actions";

interface Props { initialUsers: UserItem[]; initialEnrollments: EnrollmentItem[]; }

export function UsersPageClient({ initialUsers, initialEnrollments }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const enrollments = initialEnrollments;
  const [view, setView] = useState<"accounts" | "enrollments">("accounts");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [status, setStatus] = useState("all");
  const [enrollmentStatus, setEnrollmentStatus] = useState("ALL");
  const [method, setMethod] = useState<"SELF_SERVICE" | "ASSISTED" | null>(null);
  const [roleUser, setRoleUser] = useState<UserItem | null>(null);
  const [nextRole, setNextRole] = useState<"STAFF" | "MEMBER">("STAFF");
  const [isPending, setIsPending] = useState(false);

  const counts = useMemo(() => ({ all: users.length, active: users.filter((user) => user.isActive).length, inactive: users.filter((user) => !user.isActive).length }), [users]);
  const stats = useMemo(() => ({ admin: users.filter((user) => user.role === "ADMIN").length, staff: users.filter((user) => user.role === "STAFF").length, member: users.filter((user) => user.role === "MEMBER").length }), [users]);
  const filteredUsers = useMemo(() => users.filter((user) => {
    const term = search.trim().toLowerCase();
    const matches = !term || [user.firstName, user.lastName, user.email, user.phone].some((value) => value?.toLowerCase().includes(term));
    return matches && (roleFilter === "ALL" || user.role === roleFilter) && (status === "all" || (status === "active" ? user.isActive : !user.isActive));
  }), [users, search, roleFilter, status]);
  const filteredEnrollments = useMemo(() => enrollments.filter((item) => {
    const term = search.trim().toLowerCase();
    return (!term || `${item.firstName} ${item.lastName} ${item.email}`.toLowerCase().includes(term)) && (enrollmentStatus === "ALL" || item.status === enrollmentStatus);
  }), [enrollments, search, enrollmentStatus]);
  const refresh = () => router.refresh();
  const clearFilters = () => { setSearch(""); setRoleFilter("ALL"); setStatus("all"); setEnrollmentStatus("ALL"); };
  const hasFilters = Boolean(search) || roleFilter !== "ALL" || status !== "all" || enrollmentStatus !== "ALL";

  const updateRole = async () => {
    if (!roleUser) return;
    setIsPending(true);
    const result = await updateUserRoleAction(roleUser.id, nextRole);
    setIsPending(false);
    if (!result.success) return toast.error(result.error || "Unable to update role.");
    toast.success(`Role changed to ${nextRole === "STAFF" ? "Staff" : "Member"}.`);
    setUsers((items) => items.map((item) => item.id === roleUser.id ? { ...item, role: nextRole } : item));
    setRoleUser(null);
  };
  const runEnrollmentAction = async (action: () => Promise<{ success: boolean; message?: string; error?: string }>) => {
    setIsPending(true); const result = await action(); setIsPending(false);
    if (!result.success) return toast.error(result.error || "Unable to update enrollment.");
    toast.success(result.message || "Enrollment updated."); refresh();
  };

  return <ManagementLayout>
    <PageHeader title="People & access" description="Register shop customers and staff, manage account access, and follow every enrollment to completion." count={users.length}>
      <Button type="button" variant="outline" onClick={() => setMethod("SELF_SERVICE")}>Approve self-registration</Button>
      <Button type="button" onClick={() => setMethod("ASSISTED")}>Register in person</Button>
    </PageHeader>
    <UserStats total={users.length} adminCount={stats.admin} staffCount={stats.staff} memberCount={stats.member} />
    <div className="flex gap-1 border-b border-border/60" role="tablist" aria-label="User management views">
      {(["accounts", "enrollments"] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={view === item} onClick={() => setView(item)} className={`border-b-2 px-3 py-2 text-sm font-medium capitalize ${view === item ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{item}{item === "enrollments" ? ` (${enrollments.length})` : ""}</button>)}
    </div>
    <DockedTableCard search={search} onSearchChange={setSearch} searchPlaceholder={view === "accounts" ? "Search by name, email, or phone..." : "Search enrollments..."} status={view === "accounts" ? status : undefined} onStatusChange={view === "accounts" ? setStatus : undefined} statusCounts={counts} filterSlot={<select value={view === "accounts" ? roleFilter : enrollmentStatus} onChange={(event) => view === "accounts" ? setRoleFilter(event.target.value) : setEnrollmentStatus(event.target.value)} className="h-9.5 rounded-xl border border-input/80 bg-background/50 px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary sm:w-44">{view === "accounts" ? <><option value="ALL">All roles</option><option value="ADMIN">Admins</option><option value="STAFF">Staff</option><option value="MEMBER">Members</option></> : <><option value="ALL">All enrollment states</option><option value="APPROVED">Ready to register</option><option value="AWAITING_OTP">Awaiting OTP</option><option value="AWAITING_PASSWORD_SETUP">Password setup sent</option></>}</select>} hasActiveFilters={hasFilters} onClearFilters={clearFilters} totalFiltered={view === "accounts" ? filteredUsers.length : filteredEnrollments.length} totalAll={view === "accounts" ? users.length : enrollments.length} entityName={view === "accounts" ? "accounts" : "enrollments"}>
      {view === "accounts" ? <UserTable users={filteredUsers} onRoleChange={(user, role) => { setRoleUser(user); setNextRole(role); }} isUpdatingRole={isPending} /> : <EnrollmentTable enrollments={filteredEnrollments} isPending={isPending} onVerify={(item) => router.push(`/admin/users/enrollments/${item.id}/verify`)} onResendOtp={(item) => runEnrollmentAction(() => resendAssistedEnrollmentOtpAction(item.id))} onResendPasswordLink={(item) => runEnrollmentAction(() => resendPasswordSetupLinkAction(item.id))} onCancel={(item) => runEnrollmentAction(() => cancelEnrollmentAction(item.id))} />}
    </DockedTableCard>
    <EnrollmentDialog method={method} onOpenChange={(open) => !open && setMethod(null)} onCreated={refresh} />
    <ConfirmActionDialog open={roleUser !== null} onOpenChange={(open) => !open && setRoleUser(null)} title={`Change role to ${nextRole}?`} description={roleUser ? `Change ${roleUser.firstName} ${roleUser.lastName}'s account role to ${nextRole}. Their permissions will update immediately.` : ""} confirmLabel={`Confirm ${nextRole}`} cancelLabel="Cancel" variant="default" isPending={isPending} onConfirm={updateRole} />
  </ManagementLayout>;
}
