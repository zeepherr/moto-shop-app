"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, ChevronsUpDown, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/features/auth/actions/logout.action";
import type { AuthUserDTO } from "@/features/auth/types";

interface SidebarUserProps {
  user: AuthUserDTO | null;
  collapsed: boolean;
}

export const SidebarUser: React.FC<SidebarUserProps> = ({ user, collapsed }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const first = user?.firstName?.[0] ?? "";
  const last = user?.lastName?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase() || "A";
  const fullName = user ? `${user.firstName} ${user.lastName}` : "Administrator";
  const roleName = user?.role ? user.role.toLowerCase() : "admin";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className="relative shrink-0 border-t border-border/70 p-2.5 transition-colors sm:p-3 dark:border-white/[0.08]"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Click-outside backdrop on mobile/touch */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropup Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-40 rounded-2xl border border-border/80 bg-popover/95 p-1.5 shadow-xl backdrop-blur-xl transition-colors dark:border-white/[0.12] dark:bg-[#0c1228]/95 dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] ${
              collapsed
                ? "bottom-2 left-full ml-2 w-52"
                : "bottom-full left-2 right-2 mb-2"
            }`}
          >
            {/* User Details Header */}
            <div className="px-2.5 py-2">
              <p className="truncate text-xs font-semibold text-foreground">
                {fullName}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 capitalize">
                  <ShieldCheck className="size-3" />
                  {roleName}
                </span>
                {user?.email && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="my-1 h-px bg-border/60 dark:bg-white/[0.08]" />

            {/* Logout Action */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 active:scale-98 cursor-pointer disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
            >
              <LogOut className="size-3.5" />
              <span>{isLoggingOut ? "Signing out..." : "Log out"}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Profile Trigger Card */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="group/btn flex h-12 w-full min-w-0 items-center justify-between gap-2.5 rounded-xl px-2 transition-colors duration-150 hover:bg-muted/70 active:bg-muted cursor-pointer dark:hover:bg-white/[0.06] dark:active:bg-white/[0.08]"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#0066cc]/20 bg-[#0066cc]/10 font-semibold text-xs text-[#0066cc] shadow-xs group-hover/btn:border-[#0066cc]/40 transition-colors dark:border-white/[0.1] dark:bg-[#0066cc]/20 dark:text-[#2997ff]">
            {initials}
          </div>

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.12 }}
                className="min-w-0 text-left"
              >
                <p className="truncate text-xs font-semibold text-foreground">
                  {fullName}
                </p>
                <p className="truncate text-xs text-muted-foreground capitalize">
                  {roleName}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!collapsed && (
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover/btn:text-foreground" />
        )}
      </button>
    </div>
  );
};
