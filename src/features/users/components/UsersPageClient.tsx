"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";
import { DockedTableCard } from "@/components/management/DockedTableCard";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
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

interface Props { initialUsers: UserItem[]; initialEnrollments: EnrollmentItem[]; }
type EnrollmentMethod = "SELF_SERVICE" | "ASSISTED";

export function UsersPageClient({ initialUsers, initialEnrollments }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [view, setView] = useState<"people" | "enrollments">("people");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [accessFilter, setAccessFilter] = useState("all");
  const [enrollmentStatus, setEnrollmentStatus] = useState("ALL");
  const [method, setMethod] = useState<EnrollmentMethod | null>(null);
  const [enrollmentDefaults, setEnrollmentDefaults] = useState<{ email: string; role: "MEMBER" | "STAFF" } | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [roleUser, setRoleUser] = useState<{ user: UserItem; role: "STAFF" | "MEMBER" } | null>(null);
  const [accessUser, setAccessUser] = useState<{ user: UserItem; isActive: boolean } | null>(null);
  const [cancelItem, setCancelItem] = useState<EnrollmentItem | null>(null);
  const [restartItem, setRestartItem] = useState<EnrollmentItem | null>(null);
  const [isPending, setIsPending] = useState(false);

  const counts = useMemo(() => ({ all: users.length, active: users.filter((user) => user.isActive).length, inactive: users.filter((user) => !user.isActive).length }), [users]);
  const stats = useMemo(() => ({ admin: users.filter((user) => user.role === "ADMIN").length, staff: users.filter((user) => user.role === "STAFF").length, member: users.filter((user) => user.role === "MEMBER").length }), [users]);
  const attention = useMemo(() => ({
    codes: initialEnrollments.filter((item) => item.status === "AWAITING_OTP").length,
    setup: initialEnrollments.filter((item) => item.status === "AWAITING_PASSWORD_SETUP").length,
    delivery: initialEnrollments.filter((item) => item.lastEvent?.action.endsWith("DELIVERY_FAILED")).length,
  }), [initialEnrollments]);
  const filteredUsers = useMemo(() => users.filter((user) => {
    const term = search.trim().toLowerCase();
    const matches = !term || [user.firstName, user.lastName, user.email, user.phone].some((value) => value?.toLowerCase().includes(term));
    return matches && (roleFilter === "ALL" || user.role === roleFilter) && (accessFilter === "all" || (accessFilter === "active" ? user.isActive : !user.isActive));
  }), [users, search, roleFilter, accessFilter]);
  const filteredEnrollments = useMemo(() => initialEnrollments.filter((item) => {
    const term = search.trim().toLowerCase();
    return (!term || `${item.firstName} ${item.lastName} ${item.email}`.toLowerCase().includes(term)) && (enrollmentStatus === "ALL" || item.status === enrollmentStatus);
  }), [initialEnrollments, search, enrollmentStatus]);
  const refresh = () => router.refresh();
  const clearFilters = () => { setSearch(""); setRoleFilter("ALL"); setAccessFilter("all"); setEnrollmentStatus("ALL"); };
  const hasFilters = Boolean(search) || roleFilter !== "ALL" || accessFilter !== "all" || enrollmentStatus !== "ALL";
  const run = async (work: () => Promise<{ success: boolean; message?: string; error?: string }>, successMessage: string) => {
    setIsPending(true); const result = await work(); setIsPending(false);
    if (!result.success) return toast.error(result.error || "Unable to complete this action.");
    toast.success(result.message || successMessage); refresh();
  };
  const updateRole = async () => {
    if (!roleUser) return;
    setIsPending(true); const result = await updateUserRoleAction(roleUser.user.id, roleUser.role); setIsPending(false);
    if (!result.success) return toast.error(result.error || "Unable to update role.");
    setUsers((items) => items.map((item) => item.id === roleUser.user.id ? { ...item, role: roleUser.role } : item));
    setRoleUser(null); toast.success("Role updated. Existing sessions were revoked.");
  };
  const updateAccess = async () => {
    if (!accessUser) return;
    setIsPending(true); const result = await updateUserAccessAction(accessUser.user.id, accessUser.isActive); setIsPending(false);
    if (!result.success) return toast.error(result.error || "Unable to change account access.");
    setUsers((items) => items.map((item) => item.id === accessUser.user.id ? { ...item, isActive: accessUser.isActive } : item));
    setAccessUser(null); toast.success(accessUser.isActive ? "Access restored. Existing sessions were revoked." : "Access paused and active sessions were revoked.");
  };
  const restart = async () => {
    if (!restartItem) return;
    const item = restartItem;
    if (!["CANCELLED", "EXPIRED"].includes(item.status)) {
      setIsPending(true); const result = await cancelEnrollmentAction(item.id); setIsPending(false);
      if (!result.success) return toast.error(result.error || "Unable to restart enrollment.");
    }
    setRestartItem(null); setEnrollmentDefaults({ email: item.email, role: item.role === "STAFF" ? "STAFF" : "MEMBER" }); setMethod(item.method); refresh();
  };

  const tableFilter = view === "people" ? roleFilter : enrollmentStatus;
  return <ManagementLayout className="!space-y-4 sm:!space-y-6">
    <PageHeader compactOnMobile title="People" description="Create verified shop accounts, keep access current, and resolve enrollment work before customers leave the counter." count={users.length}>
      <Button type="button" variant="outline" onClick={() => { setEnrollmentDefaults(null); setMethod("SELF_SERVICE"); }}>Send registration link</Button>
      <Button type="button" onClick={() => { setEnrollmentDefaults(null); setMethod("ASSISTED"); }}>Register at counter</Button>
    </PageHeader>
    <UserStats total={users.length} adminCount={stats.admin} staffCount={stats.staff} memberCount={stats.member} />
    <section className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-sm font-semibold text-foreground">Enrollment queue</p><p className="text-xs text-muted-foreground">Resolve the next customer action without losing the account context.</p></div>
      <div className="flex flex-wrap gap-2">{attention.codes > 0 && <button type="button" onClick={() => { setView("enrollments"); setEnrollmentStatus("AWAITING_OTP"); }} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary"><MailCheck className="size-3.5" />{attention.codes} code{attention.codes === 1 ? "" : "s"} to verify</button>}{attention.setup > 0 && <button type="button" onClick={() => { setView("enrollments"); setEnrollmentStatus("AWAITING_PASSWORD_SETUP"); }} className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground"><CheckCircle2 className="size-3.5" />{attention.setup} setup pending</button>}{attention.delivery > 0 && <button type="button" onClick={() => setView("enrollments")} className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive"><AlertTriangle className="size-3.5" />{attention.delivery} delivery issue{attention.delivery === 1 ? "" : "s"}</button>}{!attention.codes && !attention.setup && !attention.delivery && <span className="text-xs text-muted-foreground">No enrollment work needs attention.</span>}</div>
    </section>
    <div className="flex gap-1 border-b border-border/60" role="tablist" aria-label="User management views">{(["people", "enrollments"] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={view === item} onClick={() => setView(item)} className={`border-b-2 px-3 py-2 text-sm font-medium ${view === item ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{item === "people" ? "People" : `Enrollment queue (${initialEnrollments.length})`}</button>)}</div>
    <DockedTableCard search={search} onSearchChange={setSearch} searchPlaceholder={view === "people" ? "Search people by name, email, or phone..." : "Search enrollments..."} status={view === "people" ? accessFilter : undefined} onStatusChange={view === "people" ? setAccessFilter : undefined} statusCounts={counts} filterSlot={<Select value={tableFilter} onValueChange={(selected) => view === "people" ? setRoleFilter(selected) : setEnrollmentStatus(selected)} className="h-9.5 rounded-xl border border-input/80 bg-background/50 px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary sm:w-48" options={view === "people" ? [{ value: "ALL", label: "All roles" }, { value: "ADMIN", label: "Administrators" }, { value: "STAFF", label: "Staff" }, { value: "MEMBER", label: "Members" }] : [{ value: "ALL", label: "All enrollment states" }, { value: "APPROVED", label: "Ready to register" }, { value: "AWAITING_OTP", label: "Awaiting code" }, { value: "AWAITING_PASSWORD_SETUP", label: "Password setup sent" }]} />} hasActiveFilters={hasFilters} onClearFilters={clearFilters} totalFiltered={view === "people" ? filteredUsers.length : filteredEnrollments.length} totalAll={view === "people" ? users.length : initialEnrollments.length} entityName={view === "people" ? "people" : "enrollments"}>
      {view === "people" ? <UserTable users={filteredUsers} onView={setSelectedUser} onRoleChange={(user, role) => setRoleUser({ user, role })} onAccessChange={(user, isActive) => setAccessUser({ user, isActive })} isPending={isPending} /> : <EnrollmentTable enrollments={filteredEnrollments} isPending={isPending} onVerify={(item) => router.push(`/admin/users/enrollments/${item.id}/verify`)} onResendOtp={(item) => run(() => resendAssistedEnrollmentOtpAction(item.id), "Verification code sent.")} onResendRegistrationLink={(item) => run(() => resendSelfServiceRegistrationLinkAction(item.id), "Registration link sent.")} onResendPasswordLink={(item) => run(() => resendPasswordSetupLinkAction(item.id), "Password setup link sent.")} onCancel={setCancelItem} onRestart={setRestartItem} />}
    </DockedTableCard>
    <EnrollmentDialog key={`${method ?? "closed"}:${enrollmentDefaults?.email ?? ""}`} method={method} defaults={enrollmentDefaults} onOpenChange={(open) => { if (!open) { setMethod(null); setEnrollmentDefaults(null); } }} onCreated={refresh} onConflict={() => { setView("enrollments"); refresh(); }} />
    <UserDetailDialog user={selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)} />
    <ConfirmActionDialog open={roleUser !== null} onOpenChange={(open) => !open && setRoleUser(null)} title={`Change role to ${roleUser?.role === "STAFF" ? "Staff" : "Member"}?`} description={roleUser ? `Change ${roleUser.user.firstName} ${roleUser.user.lastName}'s role. Their active sessions will be revoked.` : ""} confirmLabel="Change role" variant="default" isPending={isPending} onConfirm={updateRole} />
    <ConfirmActionDialog open={accessUser !== null} onOpenChange={(open) => !open && setAccessUser(null)} title={accessUser?.isActive ? "Restore account access?" : "Deactivate this account?"} description={accessUser ? `${accessUser.user.firstName} ${accessUser.user.lastName}'s historical records stay available. Their active sessions will be revoked.` : ""} confirmLabel={accessUser?.isActive ? "Restore access" : "Deactivate"} variant={accessUser?.isActive ? "default" : "destructive"} isPending={isPending} onConfirm={updateAccess} />
    <ConfirmActionDialog open={cancelItem !== null} onOpenChange={(open) => !open && setCancelItem(null)} title="Cancel this enrollment?" description={cancelItem ? `${cancelItem.email} will no longer be able to continue this enrollment. You can start a new one later.` : ""} confirmLabel="Cancel enrollment" variant="destructive" isPending={isPending} onConfirm={async () => { if (!cancelItem) return; await run(() => cancelEnrollmentAction(cancelItem.id), "Enrollment cancelled."); setCancelItem(null); }} />
    <ConfirmActionDialog open={restartItem !== null} onOpenChange={(open) => !open && setRestartItem(null)} title="Cancel and restart enrollment?" description={restartItem ? `The current ${restartItem.method === "ASSISTED" ? "counter" : "self-service"} flow for ${restartItem.email} will be cancelled before a fresh flow is started.` : ""} confirmLabel="Restart enrollment" variant="destructive" isPending={isPending} onConfirm={restart} />
  </ManagementLayout>;
}
