"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Bike,
  Wrench,
  Users,
  User,
} from "lucide-react";
import { ROLES } from "@/features/auth/constants";
import type { AuthUserDTO } from "@/features/auth/types";
import type { NavItem } from "./SidebarNavigation";

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

  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      document.cookie = `sidebar-collapsed=${next}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const adminNavigation: NavItem[] = [
    { label: "POS", href: "/admin/pos", icon: ShoppingCart },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Tags },
    { label: "Motor Brands", href: "/admin/motor-brands", icon: Bike },
    { label: "Motorcycles", href: "/admin/motors", icon: Bike },
    { label: "Services", href: "/admin/services", icon: Wrench },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, end: true },
  ];

  const staffNavigation: NavItem[] = [
    { label: "POS", href: "/staff/pos", icon: ShoppingCart, end: true },
    { label: "Services", href: "/staff/services", icon: Wrench },
    { label: "Profile", href: "/staff/profile", icon: User },
  ];

  const memberNavigation: NavItem[] = [
    { label: "Profile", href: "/member/profile", icon: User, end: true },
  ];

  const navigation =
    user?.role === ROLES.ADMIN
      ? adminNavigation
      : user?.role === ROLES.STAFF
        ? staffNavigation
        : memberNavigation;

  const activeItem =
    navigation.find((item) =>
      item.end ? pathname === item.href : pathname.startsWith(item.href),
    ) ?? navigation[0];

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

      {/* MOBILE SIDEBAR */}
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
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[3px] md:hidden cursor-pointer"
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

      {/* RIGHT CONTENT */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <AppHeader
          section={section}
          title={activeItem?.label}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="relative mt-16 min-h-0 min-w-0 flex-1 overflow-y-auto scroll-smooth px-2 pb-3 sm:px-3 sm:pb-4 lg:px-5 lg:pb-5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
