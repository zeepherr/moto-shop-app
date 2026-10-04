"use client";

import React from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, Settings, UserRound } from "lucide-react";

interface SidebarAccountMenuProps {
  fullName: string;
  profileHref: string;
  settingsHref?: string;
  position: { left: number; top: number };
  width: number;
  isLoggingOut: boolean;
  onLogout: () => void;
  onNavigate: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function SidebarAccountMenu({
  fullName,
  profileHref,
  settingsHref,
  position,
  width,
  isLoggingOut,
  onLogout,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: SidebarAccountMenuProps) {
  return createPortal(
    <AnimatePresence>
      <motion.div
        role="menu"
        aria-label={`${fullName} account actions`}
        initial={{ opacity: 0, y: 5, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ duration: 0.14, ease: "easeOut" }}
        style={{ left: position.left, top: position.top, width }}
        onPointerDown={(event) => event.stopPropagation()}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="fixed z-[100] rounded-2xl border border-border/80 bg-popover p-2 text-popover-foreground shadow-[0_18px_48px_rgba(0,0,0,0.24)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.5)]"
      >
        <Link
          href={profileHref}
          role="menuitem"
          onClick={onNavigate}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <UserRound className="size-4 text-muted-foreground" />
          Profile
        </Link>

        {settingsHref && (
          <Link
            href={settingsHref}
            role="menuitem"
            onClick={onNavigate}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Settings className="size-4 text-muted-foreground" />
            Settings
          </Link>
        )}

        <div className="my-2 border-t border-border/70" />

        <button
          type="button"
          role="menuitem"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60 dark:text-rose-400"
        >
          <LogOut className="size-4" />
          {isLoggingOut ? "Signing out…" : "Log out"}
        </button>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
