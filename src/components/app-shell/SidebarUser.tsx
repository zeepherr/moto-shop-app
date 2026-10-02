"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import type { AuthUserDTO } from "@/features/auth/types";

interface SidebarUserProps {
  user: AuthUserDTO | null;
  collapsed: boolean;
}

export const SidebarUser: React.FC<SidebarUserProps> = ({ user, collapsed }) => {
  const first = user?.firstName?.[0] ?? "";
  const last = user?.lastName?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase() || "H";

  return (
    <div className="shrink-0 overflow-hidden border-t border-white/[0.06] p-3">
      <div className="flex h-12 min-w-0 items-center gap-3 rounded-xl px-0 transition-colors duration-150 hover:bg-muted/40">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
          {initials}
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.13, ease: "easeOut" }}
              className="min-w-0 whitespace-nowrap"
            >
              <p className="truncate text-sm font-medium text-foreground">
                {user ? `${user.firstName} ${user.lastName}` : "Guest"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.role?.toLowerCase() || "guest"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
