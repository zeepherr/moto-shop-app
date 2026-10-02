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
        `group relative flex h-full w-full min-h-0 flex-col overflow-hidden border-r border-cyan-300/[0.10]
        bg-[linear-gradient(180deg,rgba(7,12,36,0.88),rgba(3,7,29,0.82))]
        shadow-[14px_0_40px_rgba(0,0,0,0.16),inset_-1px_0_0_rgba(255,255,255,0.025)]
        backdrop-blur-[16px] backdrop-saturate-[125%]`,
        mobile &&
          `rounded-[22px] border border-white/[0.08]
          shadow-[0_24px_80px_rgba(0,0,0,0.45),0_0_40px_rgba(34,211,238,0.035),inset_0_1px_0_rgba(255,255,255,0.08)]
          backdrop-blur-[20px]`,
      )}
    >
      {/* Cyan refraction */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_12%,rgba(34,211,238,0.055),transparent_30%)]"
      />

      {/* Blue bottom glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_90%,rgba(59,130,246,0.055),transparent_28%)]"
      />

      {/* Top glass reflection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
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
