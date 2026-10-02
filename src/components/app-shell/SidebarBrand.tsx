"use client";

import React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface SidebarBrandProps {
  workspace?: string;
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

export const SidebarBrand: React.FC<SidebarBrandProps> = ({
  workspace = "Shop management",
  collapsed,
  onToggle,
}) => {
  return (
    <div className="flex h-16 shrink-0 items-center overflow-hidden border-b border-border/70 px-3 transition-colors dark:border-white/[0.06]">
      {/* Brand icon */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Home"}
        className="group relative flex size-9 shrink-0 items-center justify-center rounded-xl cursor-pointer"
      >
        <div className="flex size-9 items-center justify-center rounded-xl bg-[#0066cc] text-sm font-semibold text-white shadow-xs transition-all duration-150 group-hover:scale-95">
          H
        </div>

        {collapsed && (
          <PanelLeftOpen className="absolute size-5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 text-foreground" />
        )}
      </button>

      {/* Brand text */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="ml-3 min-w-0 flex-1 whitespace-nowrap"
          >
            <p className="truncate text-sm font-semibold text-foreground">HrungMoto</p>
            <p className="truncate text-xs text-muted-foreground">{workspace}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse button */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.button
            type="button"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <PanelLeftClose className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
