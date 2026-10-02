"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Bike,
  Wrench,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLES, type UserRole } from "@/features/auth/constants";

interface SidebarProps {
  role?: UserRole;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<SidebarProps> = ({ role, mobileOpen, onCloseMobile }) => {
  const pathname = usePathname();

  const adminLinks = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "POS", href: "/admin/pos", icon: ShoppingCart },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Tags },
    { label: "Motor Brands", href: "/admin/motor-brands", icon: Bike },
    { label: "Motorcycles", href: "/admin/motors", icon: Bike },
    { label: "Services", href: "/admin/services", icon: Wrench },
  ];

  const staffLinks = [
    { label: "POS", href: "/staff/pos", icon: ShoppingCart },
    { label: "Profile", href: "/staff/profile", icon: User },
  ];

  const memberLinks = [
    { label: "Profile", href: "/member/profile", icon: User },
  ];

  const links = role === ROLES.ADMIN ? adminLinks : role === ROLES.STAFF ? staffLinks : memberLinks;

  const content = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
            H
          </div>
          <span className="font-bold text-base tracking-tight">HrungMoto</span>
        </Link>
        <button onClick={onCloseMobile} className="md:hidden p-1 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">{content}</aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative w-64 max-w-[80vw] h-full z-50 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
