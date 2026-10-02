"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  end?: boolean;
}

interface SidebarNavigationProps {
  navigation: NavItem[];
  collapsed: boolean;
  onNavigate?: () => void;
}

const navigationVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.03,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  navigation,
  collapsed,
  onNavigate,
}) => {
  const pathname = usePathname();

  return (
    <motion.nav
      aria-label="Main navigation"
      className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 ${collapsed ? "space-y-1.5" : "space-y-1"}`}
      variants={navigationVariants}
      initial="hidden"
      animate="visible"
    >
      {!collapsed && (
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/75">
          Workspace
        </p>
      )}
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = item.end
          ? pathname === item.href
          : pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

        return (
          <motion.div
            key={item.href}
            variants={itemVariants}
            whileHover={collapsed ? undefined : { x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group/nav relative flex h-10 min-w-0 items-center rounded-xl text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                collapsed ? "justify-center px-0" : "gap-3 px-3",
                isActive
                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground [&>svg]:text-sidebar-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent/65 hover:text-sidebar-foreground",
              )}
            >
              {isActive && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-sidebar-primary" />}
              <Icon className="size-[18px] shrink-0 stroke-[1.8]" />

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="min-w-0 truncate whitespace-nowrap text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>
        );
      })}
    </motion.nav>
  );
};
