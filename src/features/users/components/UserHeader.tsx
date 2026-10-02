"use client";

import React from "react";
import { UsersRound } from "lucide-react";

interface UserHeaderProps {
  totalUsers: number;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ totalUsers }) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          User Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage members and staff access to your shop.
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <UsersRound className="size-4" />
        <span>{totalUsers} users</span>
      </div>
    </div>
  );
};
