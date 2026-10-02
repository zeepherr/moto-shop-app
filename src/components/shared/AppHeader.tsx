"use client";

import React from "react";
import { Menu } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import type { AuthUserDTO } from "@/features/auth/types";

interface AppHeaderProps {
  user: AuthUserDTO | null;
  onOpenMobileSidebar: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ user, onOpenMobileSidebar }) => {
  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold text-lg tracking-tight hidden sm:inline-block">HrungMoto</span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 text-sm">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-foreground leading-none">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-primary/10 text-primary border border-primary/20">
              {user.role}
            </span>
          </div>
        )}
        <LogoutButton />
      </div>
    </header>
  );
};
