"use client";

import React from "react";
import { UsersRound } from "lucide-react";

interface UserHeaderProps {
  totalUsers: number;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ totalUsers }) => {
  return (
    <div className="sticky top-1 z-20 bg-background/95 backdrop-blur-md pb-2 pt-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage customer accounts, staff privileges, and shop access
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5 text-xs text-muted-foreground font-medium">
          <UsersRound className="size-3.5 text-foreground" />
          <span>{totalUsers} registered users</span>
        </div>
      </div>
    </div>
  );
};
