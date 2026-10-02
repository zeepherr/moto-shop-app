"use client";

import React from "react";
import { ShieldCheck, UserRound, UsersRound } from "lucide-react";
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
  createdAt: Date | string;
}

interface UserTableProps {
  users: UserItem[];
  onRoleChange: (user: UserItem, nextRole: "STAFF" | "MEMBER") => void;
  isUpdatingRole?: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onRoleChange,
  isUpdatingRole = false,
}) => {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/60">
          <UsersRound className="size-6" />
        </div>
        <p className="font-semibold text-foreground text-sm">No users found</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Try clearing search filters or changing role selection.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full min-w-[700px] text-sm">
      <thead>
        <tr className="border-b border-border/60 bg-muted/30">
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            User Name
          </th>
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Contact
          </th>
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Role
          </th>
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Status
          </th>
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Joined
          </th>
          <th className="w-16 px-4 py-3 text-right font-medium text-muted-foreground">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-border/40">
        {users.map((user) => {
          const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Unnamed user";
          const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U";
          return (
            <tr key={user.id} className="group hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9.5 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/50 font-bold text-xs text-foreground uppercase tracking-wider shadow-2xs group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID #{user.id}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3.5">
                <div className="min-w-0">
                  <p className="max-w-64 truncate text-sm text-foreground">
                    {user.email || user.phone || "No contact info"}
                  </p>
                  {user.email && user.phone && (
                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                  )}
                </div>
              </td>

              <td className="px-4 py-3.5">
                {user.role === "ADMIN" ? (
                  <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-500 border border-rose-500/20">
                    Admin
                  </span>
                ) : user.role === "STAFF" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0066cc]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2997ff] border border-[#0066cc]/20">
                    <ShieldCheck className="size-3" />
                    Staff
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border/50">
                    <UserRound className="size-3" />
                    Member
                  </span>
                )}
              </td>

              <td className="px-4 py-3.5">
                <StatusBadge isActive={user.isActive} />
              </td>

              <td className="px-4 py-3.5 text-xs text-muted-foreground tabular-nums">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </td>

              <td className="px-4 py-3.5 text-right">
                {user.role !== "ADMIN" && (
                  <ActionMenu
                    label={fullName}
                    disabled={isUpdatingRole}
                    items={[
                      user.role === "MEMBER"
                        ? {
                            label: "Promote to staff",
                            icon: ShieldCheck,
                            tone: "success",
                            onSelect: () => onRoleChange(user, "STAFF"),
                          }
                        : {
                            label: "Change to member",
                            icon: UserRound,
                            onSelect: () => onRoleChange(user, "MEMBER"),
                          },
                    ]}
                  />
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
