"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

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
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pb-1">
      <div className="relative w-full sm:min-w-64 sm:flex-1 sm:max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search name, email or phone..."
          className="h-10 rounded-xl border border-input bg-card pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
        />
      </div>

      <Select
        value={roleFilter}
        onValueChange={setRoleFilter}
        options={[
          { value: "ALL", label: "All roles" },
          { value: "MEMBER", label: "Members" },
          { value: "STAFF", label: "Staff" },
        ]}
        className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus:ring-2 focus:ring-primary sm:w-40 cursor-pointer"
      />
    </div>
  );
};
