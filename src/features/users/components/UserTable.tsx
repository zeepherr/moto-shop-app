"use client";

import { Eye, ShieldCheck, UserCheck, UserRound, UserX, UsersRound } from "lucide-react";
import { ActionMenu } from "@/components/management/ActionMenu";
import { StatusBadge } from "@/components/management/StatusBadge";

export interface UserItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: "ADMIN" | "STAFF" | "MEMBER";
  isActive: boolean;
  createdAt: string;
  emailVerifiedAt: string | null;
  hasProfilePhoto: boolean;
  lastSignedInAt: string | null;
}

interface UserTableProps {
  users: UserItem[];
  onView: (user: UserItem) => void;
  onRoleChange: (user: UserItem, nextRole: "STAFF" | "MEMBER") => void;
  onAccessChange: (user: UserItem, isActive: boolean) => void;
  isPending?: boolean;
}

const formatDate = (date: string | null) => date
  ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  : "Not yet";

const roleLabel = (role: UserItem["role"]) => role[0] + role.slice(1).toLowerCase();

export function UserTable({ users, onView, onRoleChange, onAccessChange, isPending = false }: UserTableProps) {
  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/60"><UsersRound className="size-6" /></div>
        <p className="text-sm font-semibold text-foreground">No people match these filters</p>
        <p className="max-w-xs text-xs text-muted-foreground">Try another search or clear the current filter.</p>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-3 p-3 md:hidden">
      {users.map((user) => {
        const name = `${user.firstName} ${user.lastName}`.trim() || "Unnamed user";
        const profileComplete = user.firstName !== "New" && Boolean(user.phone || user.hasProfilePhoto);
        const actions = [
          { label: "View account details", icon: Eye, onSelect: () => onView(user) },
          ...(user.role !== "ADMIN"
            ? [
                user.role === "MEMBER"
                  ? { label: "Promote to staff", icon: ShieldCheck, tone: "success" as const, onSelect: () => onRoleChange(user, "STAFF") }
                  : { label: "Change to member", icon: UserRound, onSelect: () => onRoleChange(user, "MEMBER") },
                user.isActive
                  ? { label: "Deactivate access", icon: UserX, tone: "danger" as const, separatorBefore: true, onSelect: () => onAccessChange(user, false) }
                  : { label: "Reactivate access", icon: UserCheck, tone: "success" as const, separatorBefore: true, onSelect: () => onAccessChange(user, true) },
              ]
            : []),
        ];
        return <article key={user.id} className="rounded-xl border border-border/70 bg-background p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/50 text-xs font-bold uppercase tracking-wider text-foreground">{`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() || "U"}</div>
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{name}</p><p className="text-xs text-muted-foreground">Account #{user.id}</p></div>
            </div>
            <div className="[&>button]:size-11 [&>button]:rounded-xl"><ActionMenu label={name} disabled={isPending} items={actions} /></div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">{roleLabel(user.role)}</span>
            <StatusBadge isActive={user.isActive} />
            <span className="text-xs text-muted-foreground">{profileComplete ? "Profile complete" : "Profile needs update"}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border/60 pt-3 text-xs">
            <div className="min-w-0"><p className="text-muted-foreground">Contact</p><p className="mt-1 truncate font-medium text-foreground">{user.email || user.phone || "Not added"}</p><p className="mt-0.5 text-muted-foreground">{user.emailVerifiedAt ? "Email verified" : "Email not verified"}</p></div>
            <div><p className="text-muted-foreground">Recent sign-in</p><p className="mt-1 font-medium text-foreground">{formatDate(user.lastSignedInAt)}</p></div>
          </div>
        </article>;
      })}
    </div>
    <div className="hidden overflow-x-auto md:block">
    <table className="w-full min-w-[920px] text-sm">
      <thead>
        <tr className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <th className="px-4 py-3 font-medium">Person</th>
          <th className="px-4 py-3 font-medium">Contact</th>
          <th className="px-4 py-3 font-medium">Access</th>
          <th className="px-4 py-3 font-medium">Profile</th>
          <th className="px-4 py-3 font-medium">Recent sign-in</th>
          <th className="w-16 px-4 py-3"><span className="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/40">
        {users.map((user) => {
          const name = `${user.firstName} ${user.lastName}`.trim() || "Unnamed user";
          const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() || "U";
          const profileComplete = user.firstName !== "New" && Boolean(user.phone || user.hasProfilePhoto);
          const actions = [
            { label: "View account details", icon: Eye, onSelect: () => onView(user) },
            ...(user.role !== "ADMIN"
              ? [
                  user.role === "MEMBER"
                    ? { label: "Promote to staff", icon: ShieldCheck, tone: "success" as const, onSelect: () => onRoleChange(user, "STAFF") }
                    : { label: "Change to member", icon: UserRound, onSelect: () => onRoleChange(user, "MEMBER") },
                  user.isActive
                    ? { label: "Deactivate access", icon: UserX, tone: "danger" as const, separatorBefore: true, onSelect: () => onAccessChange(user, false) }
                    : { label: "Reactivate access", icon: UserCheck, tone: "success" as const, separatorBefore: true, onSelect: () => onAccessChange(user, true) },
                ]
              : []),
          ];
          return (
            <tr key={user.id} className="group transition-colors hover:bg-muted/30">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/50 text-xs font-bold uppercase tracking-wider text-foreground transition-colors group-hover:border-primary/40 group-hover:bg-primary/5">{initials}</div>
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{name}</p><p className="text-xs text-muted-foreground">Account #{user.id}</p></div>
                </div>
              </td>
              <td className="px-4 py-3.5"><p className="max-w-56 truncate text-sm text-foreground">{user.email || user.phone || "No contact added"}</p><p className="text-xs text-muted-foreground">{user.emailVerifiedAt ? "Email verified" : "Email not verified"}</p></td>
              <td className="px-4 py-3.5"><div className="flex items-center gap-2"><span className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">{roleLabel(user.role)}</span><StatusBadge isActive={user.isActive} /></div></td>
              <td className="px-4 py-3.5"><p className="text-sm font-medium text-foreground">{profileComplete ? "Complete" : "Needs update"}</p><p className="text-xs text-muted-foreground">{profileComplete ? "Contact details added" : "Person can finish this later"}</p></td>
              <td className="px-4 py-3.5 text-xs tabular-nums text-muted-foreground">{formatDate(user.lastSignedInAt)}</td>
              <td className="px-4 py-3.5 text-right"><ActionMenu label={name} disabled={isPending} items={actions} /></td>
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
    </>
  );
}
