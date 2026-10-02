"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";
import { DockedTableCard } from "@/components/management/DockedTableCard";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { UserStats } from "./UserStats";
import { UserTable, type UserItem } from "./UserTable";
import { updateUserRoleAction } from "../actions/user.actions";

interface UsersPageClientProps {
  initialUsers: UserItem[];
}

export const UsersPageClient: React.FC<UsersPageClientProps> = ({
  initialUsers,
}) => {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [status, setStatus] = useState("all");

  const [roleUser, setRoleUser] = useState<UserItem | null>(null);
  const [nextRole, setNextRole] = useState<"STAFF" | "MEMBER">("STAFF");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const adminCount = useMemo(
    () => users.filter((u) => u.role === "ADMIN").length,
    [users]
  );
  const staffCount = useMemo(
    () => users.filter((u) => u.role === "STAFF").length,
    [users]
  );
  const memberCount = useMemo(
    () => users.filter((u) => u.role === "MEMBER").length,
    [users]
  );

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !term ||
        u.firstName?.toLowerCase().includes(term) ||
        u.lastName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phone?.includes(term);

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

      const matchesStatus =
        status === "all" ||
        (status === "active" && u.isActive) ||
        (status === "inactive" && !u.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, status]);

  const counts = useMemo(
    () => ({
      all: users.length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
    }),
    [users]
  );

  const handleRoleChange = (user: UserItem, role: "STAFF" | "MEMBER") => {
    setRoleUser(user);
    setNextRole(role);
    setDialogOpen(true);
  };

  const handleConfirmRole = async () => {
    if (!roleUser) return;
    setIsUpdating(true);
    try {
      const res = await updateUserRoleAction(roleUser.id, nextRole);
      if (res.success) {
        toast.success(`User role updated to ${nextRole}`);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === roleUser.id ? { ...u, role: nextRole } : u
          )
        );
        setDialogOpen(false);
        setRoleUser(null);
      } else {
        toast.error(res.error || "Failed to update user role");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ManagementLayout>
      <PageHeader
        title="User Management"
        description="Manage customer accounts, technician staff privileges, and administrator access"
        count={users.length}
      />

      <UserStats
        total={users.length}
        adminCount={adminCount}
        staffCount={staffCount}
        memberCount={memberCount}
      />

      <DockedTableCard
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or phone..."
        status={status}
        onStatusChange={setStatus}
        statusCounts={counts}
        filterSlot={
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9.5 rounded-xl border border-input/80 bg-background/50 px-3 text-xs sm:text-sm text-foreground shadow-2xs outline-none focus:ring-1 focus:ring-primary sm:w-40 cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admins</option>
            <option value="STAFF">Staff</option>
            <option value="MEMBER">Members</option>
          </select>
        }
        hasActiveFilters={
          search.trim() !== "" || roleFilter !== "ALL" || status !== "all"
        }
        onClearFilters={() => {
          setSearch("");
          setRoleFilter("ALL");
          setStatus("all");
        }}
        totalFiltered={filteredUsers.length}
        totalAll={users.length}
        entityName="users"
      >
        <UserTable
          users={filteredUsers}
          onRoleChange={handleRoleChange}
          isUpdatingRole={isUpdating}
        />
      </DockedTableCard>

      <ConfirmActionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setRoleUser(null);
        }}
        title={`Change role to ${nextRole}?`}
        description={
          roleUser
            ? `Are you sure you want to change "${roleUser.firstName} ${roleUser.lastName}" from ${roleUser.role} to ${nextRole}? This will immediately alter their system permissions.`
            : ""
        }
        confirmLabel={`Confirm ${nextRole}`}
        cancelLabel="Cancel"
        variant="default"
        isPending={isUpdating}
        onConfirm={handleConfirmRole}
      />
    </ManagementLayout>
  );
};
