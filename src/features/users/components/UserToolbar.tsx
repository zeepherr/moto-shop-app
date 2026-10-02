"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
}

export const UserToolbar: React.FC<UserToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
}) => {
  return (
    <div className="flex flex-col gap-3 border-b border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search name, email or phone..."
          className="h-9 pl-9"
        />
      </div>

      <select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
        className="h-9 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus:ring-2 focus:ring-primary sm:w-40 cursor-pointer"
      >
        <option value="ALL">All roles</option>
        <option value="MEMBER">Members</option>
        <option value="STAFF">Staff</option>
      </select>
    </div>
  );
};
