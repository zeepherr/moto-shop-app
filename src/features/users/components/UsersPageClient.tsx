"use client";

import React, { useMemo, useState } from "react";
import { UserHeader } from "./UserHeader";
import { UserSummary } from "./UserSummary";
import { UserToolbar } from "./UserToolbar";
import { UserTable } from "./UserTable";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateUserRoleAction } from "../actions/user.actions";
import { toast } from "sonner";

interface UserItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: "ADMIN" | "STAFF" | "MEMBER";
  isActive: boolean;
  createdAt: Date | string;
}

interface UsersPageClientProps {
  initialUsers: UserItem[];
}

export const UsersPageClient: React.FC<UsersPageClientProps> = ({ initialUsers }) => {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [roleUser, setRoleUser] = useState<UserItem | null>(null);
  const [nextRole, setNextRole] = useState<"STAFF" | "MEMBER">("STAFF");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const memberCount = useMemo(() => users.filter((u) => u.role === "MEMBER").length, [users]);
  const staffCount = useMemo(() => users.filter((u) => u.role === "STAFF").length, [users]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !term ||
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phone?.includes(term);

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

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
        toast.success(`Role updated to ${nextRole}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === roleUser.id ? { ...u, role: nextRole } : u)),
        );
        setDialogOpen(false);
      } else {
        toast.error(res.error || "Failed to update role");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mt-2 space-y-4 sm:px-2.5 pr-1.5">
      <UserHeader totalUsers={users.length} />

      <UserSummary
        totalUsers={users.length}
        memberCount={memberCount}
        staffCount={staffCount}
      />

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <UserToolbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
        />

        <UserTable
          users={filteredUsers}
          totalUsers={users.length}
          onRoleChange={handleRoleChange}
          isUpdatingRole={isUpdating}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogClose onClose={() => setDialogOpen(false)} />
        <DialogHeader>
          <DialogTitle>
            {nextRole === "STAFF" ? "Promote this member to staff?" : "Change this staff member to member?"}
          </DialogTitle>
          <DialogDescription>
            {roleUser &&
              (nextRole === "STAFF"
                ? `${roleUser.firstName} ${roleUser.lastName} will receive staff access to the shop management system.`
                : `${roleUser.firstName} ${roleUser.lastName} will lose staff access and become a regular member.`)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={nextRole === "STAFF" ? "default" : "destructive"}
            disabled={isUpdating}
            onClick={handleConfirmRole}
          >
            {isUpdating ? "Updating..." : nextRole === "STAFF" ? "Promote to Staff" : "Change to Member"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
