"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarNavigation, type NavItem } from "./SidebarNavigation";
import { SidebarUser } from "./SidebarUser";
import type { AuthUserDTO } from "@/features/auth/types";

interface AppSidebarProps {
  navigation: NavItem[];
  workspace?: string;
  user: AuthUserDTO | null;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  mobile?: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  navigation,
  workspace = "Shop management",
  user,
  collapsed,
  onToggle,
  onNavigate,
  mobile = false,
}) => {
  return (
    <aside
      className={cn(
        `group relative flex h-full w-full min-h-0 flex-col overflow-hidden border-r border-border/80
        bg-card shadow-xs backdrop-blur-xl transition-colors
        dark:border-white/[0.08]
        dark:bg-[linear-gradient(180deg,rgba(7,12,36,0.88),rgba(3,7,29,0.82))]
        dark:shadow-[14px_0_40px_rgba(0,0,0,0.16),inset_-1px_0_0_rgba(255,255,255,0.025)]`,
        mobile &&
          `rounded-[22px] border border-border/80 shadow-xl
          dark:border-white/[0.08]
          dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]`,
      )}
    >
      {/* Dark mode subtle ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_0%_12%,rgba(0,102,204,0.08),transparent_30%)] dark:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 z-10 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent dark:block"
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <SidebarBrand
          workspace={workspace}
          collapsed={collapsed}
          onToggle={onToggle}
          mobile={mobile}
        />

        <SidebarNavigation
          navigation={navigation}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />

        <SidebarUser user={user} collapsed={collapsed} />
      </div>
    </aside>
  );
};
