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
      className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-1.5 sm:p-2.5"
      variants={navigationVariants}
      initial="hidden"
      animate="visible"
    >
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
              className={cn(
                "group/nav relative flex h-10 min-w-0 items-center gap-3 rounded-xl px-3 border border-transparent text-sm transition-all duration-150",
                isActive
                  ? "border-[#0066cc]/25 bg-[#0066cc]/10 font-semibold text-[#0066cc] shadow-2xs [&>svg]:text-[#0066cc] dark:border-[#0066cc]/30 dark:bg-[#0066cc]/20 dark:text-[#2997ff] dark:[&>svg]:text-[#2997ff]"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:hover:bg-white/[0.05] dark:hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0 stroke-[1.8]" />

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
