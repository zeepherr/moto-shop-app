"use client";

import React, { useState } from "react";
import { ShieldCheck, UserRound, UsersRound, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface UserTableProps {
  users: UserItem[];
  totalUsers: number;
  onRoleChange: (user: UserItem, nextRole: "STAFF" | "MEMBER") => void;
  isUpdatingRole?: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  totalUsers,
  onRoleChange,
  isUpdatingRole = false,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="min-w-60 px-5">User</TableHead>
              <TableHead className="min-w-60">Contact</TableHead>
              <TableHead className="min-w-36">Role</TableHead>
              <TableHead className="min-w-32">Status</TableHead>
              <TableHead className="min-w-32">Joined</TableHead>
              <TableHead className="w-16 text-right pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.length > 0 ? (
              users.map((user) => {
                const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Unnamed user";
                const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U";
                const isMenuOpen = openDropdownId === user.id;

                return (
                  <TableRow key={user.id} className="group transition-colors hover:bg-muted/20">
                    <TableCell className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">ID #{user.id}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="min-w-0">
                        <p className="max-w-64 truncate text-sm text-foreground">
                          {user.email || user.phone || "No contact information"}
                        </p>
                        {user.email && user.phone && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{user.phone}</p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {user.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                          Admin
                        </span>
                      ) : user.role === "STAFF" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          <ShieldCheck className="size-3.5" />
                          Staff
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          <UserRound className="size-3.5" />
                          Member
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                      }`}>
                        <span className={`size-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </TableCell>

                    <TableCell className="pr-4 text-right">
                      {user.role !== "ADMIN" && (
                        <div className="relative inline-block text-left">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isUpdatingRole}
                            onClick={() => setOpenDropdownId(isMenuOpen ? null : user.id)}
                            className="size-8 p-0 cursor-pointer"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>

                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenDropdownId(null)}
                              />
                              <div className="absolute right-0 z-50 mt-1 w-48 rounded-xl border border-border bg-popover p-1 shadow-lg text-popover-foreground">
                                {user.role === "MEMBER" ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      onRoleChange(user, "STAFF");
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-muted cursor-pointer transition-colors text-foreground"
                                  >
                                    <ShieldCheck className="size-4 text-primary" />
                                    Promote to Staff
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      onRoleChange(user, "MEMBER");
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-muted cursor-pointer transition-colors text-foreground"
                                  >
                                    <UserRound className="size-4 text-muted-foreground" />
                                    Change to Member
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                      <UsersRound className="size-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No users found</p>
                    <p className="mt-1 text-xs text-muted-foreground">Try changing your search or role filter.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {users.length > 0 && (
        <div className="border-t border-border/60 bg-muted/10 px-4 py-2.5">
          <p className="text-xs text-muted-foreground">Showing {users.length} of {totalUsers} users</p>
        </div>
      )}
    </>
  );
};
