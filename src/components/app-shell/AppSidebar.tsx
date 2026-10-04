"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarNavigation } from "./SidebarNavigation";
import type { NavItem } from "./navigation.config";
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
        `group relative flex h-full w-full min-h-0 flex-col border-r border-sidebar-border
        bg-sidebar text-sidebar-foreground transition-colors`,
        mobile &&
          `overflow-visible rounded-2xl border border-sidebar-border shadow-xl`,
      )}
    >
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
