"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { ROLES } from "@/features/auth/constants";
import type { AuthUserDTO } from "@/features/auth/types";
import { getMoreNavigation, getNavigation } from "./navigation.config";
import { isNavItemActive } from "./nav-utils";
import { MobileTabBar } from "./MobileTabBar";

interface AppShellProps {
  user: AuthUserDTO | null;
  section?: string;
  workspace?: string;
  initialSidebarCollapsed?: boolean;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  user,
  section = "Shop Management",
  workspace = "Shop management",
  initialSidebarCollapsed = false,
  children,
}) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialSidebarCollapsed);

  const isAdmin = user?.role === ROLES.ADMIN;
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      document.cookie = `sidebar-collapsed=${next}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  };

  useEffect(() => {
    if (isAdmin) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAdmin]);

  const role = user?.role ?? ROLES.MEMBER;
  const navigation = getNavigation(role);
  const activeItem = [...navigation, ...getMoreNavigation(role)].find((item) =>
    isNavItemActive(pathname, item),
  ) ?? navigation[0];
  const mainPadding = isAdmin
    ? "pb-[calc(64px+env(safe-area-inset-bottom)+12px)] md:pb-5"
    : "pb-3 sm:pb-4 lg:pb-5";
  const mainTopSpacing = isAdmin
    ? "mt-0 pt-[env(safe-area-inset-top)] md:mt-16 md:pt-0"
    : "mt-16";

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* DESKTOP SIDEBAR */}
      <motion.div
        initial={false}
        animate={{ width: collapsed ? 72 : 224 }}
        transition={{ type: "spring", stiffness: 300, damping: 32, mass: 0.7 }}
        className="hidden h-full shrink-0 md:block"
      >
        <AppSidebar
          navigation={navigation}
          workspace={workspace}
          user={user}
          collapsed={collapsed}
          onToggle={toggleSidebar}
        />
      </motion.div>

      {/* Keep the existing mobile drawer for roles scheduled for a later navigation phase. */}
      {!isAdmin && (
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-40 cursor-pointer bg-black/45 backdrop-blur-[3px] md:hidden"
              />

              <motion.div
                initial={{ x: "-100%", opacity: 0.7 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0.7 }}
                transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.8 }}
                className="fixed inset-y-0 left-0 z-50 w-[min(86vw,300px)] p-2 md:hidden"
              >
                <AppSidebar
                  navigation={navigation}
                  workspace={workspace}
                  user={user}
                  collapsed={false}
                  mobile
                  onToggle={() => setMobileOpen(false)}
                  onNavigate={() => setMobileOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* RIGHT CONTENT */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <AppHeader
          section={section}
          title={activeItem?.label}
          showMobileMenu={!isAdmin}
          hideOnMobile={isAdmin}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className={`relative ${mainTopSpacing} min-h-0 min-w-0 flex-1 overflow-y-auto scroll-smooth px-2 sm:px-3 lg:px-5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${mainPadding}`}>
          {children}
        </main>
      </div>
      {isAdmin && <MobileTabBar user={user} />}
    </div>
  );
};
