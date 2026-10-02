"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { logoutAction } from "@/features/auth/actions/logout.action";
import type { AuthUserDTO } from "@/features/auth/types";
import { SidebarAccountMenu } from "./SidebarAccountMenu";
interface SidebarUserProps {
  user: AuthUserDTO | null;
  collapsed: boolean;
}
interface MenuPosition {
  left: number;
  top: number;
}
export const SidebarUser: React.FC<SidebarUserProps> = ({ user, collapsed }) => {
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isOpen = position !== null;
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "Administrator";
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "A";
  const roleName = user?.role === "ADMIN" ? "Administrator" : user?.role === "STAFF" ? "Staff" : "Member";
  const cancelScheduledClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };
  const closeMenu = useCallback((restoreFocus = false) => {
    cancelScheduledClose();
    setPosition(null);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);
  const scheduleClose = () => {
    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => setPosition(null), 180);
  };
  const openMenu = () => {
    cancelScheduledClose();
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const menuWidth = collapsed ? 272 : 224;
    const menuHeight = 166;
    const gap = 10;
    const left = collapsed ? rect.right + gap : rect.left;
    const top = collapsed
      ? Math.max(12, Math.min(rect.bottom - menuHeight, window.innerHeight - menuHeight - 12))
      : Math.max(12, rect.top - menuHeight - gap);

    setPosition({
      left: Math.max(12, Math.min(left, window.innerWidth - menuWidth - 12)),
      top,
    });
  };
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!triggerRef.current?.contains(event.target as Node)) closeMenu();
    };
    const handleViewportChange = () => closeMenu();

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [closeMenu, isOpen]);
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };
  return (
    <div
      className={`shrink-0 border-t border-border/70 p-2 transition-colors dark:border-white/[0.08] ${collapsed ? "sm:p-2" : "sm:p-3"}`}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            openMenu();
          }
        }}
        title={collapsed ? `${fullName} · ${roleName}` : undefined}
        aria-label={`Account menu for ${fullName}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`group/account flex min-h-12 w-full min-w-0 items-center rounded-xl border border-transparent text-left transition-colors hover:border-border/70 hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:border-white/[0.08] dark:hover:bg-white/[0.05] ${collapsed ? "justify-center px-1.5" : "gap-3 px-2.5"}`}
      >
        <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-xs font-semibold text-primary transition-colors group-hover/account:border-primary/40 dark:bg-primary/15">
          {initials}
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-sidebar bg-emerald-500" />
        </span>

        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold leading-5 text-foreground">{fullName}</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-xs leading-4 text-muted-foreground">
                <ShieldCheck className="size-3 text-primary" />
                {roleName}
              </span>
            </span>
            <ChevronUp className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {isOpen && position && (
        <SidebarAccountMenu
          user={user}
          fullName={fullName}
          initials={initials}
          position={position}
          width={collapsed ? 272 : 224}
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
          onMouseEnter={cancelScheduledClose}
          onMouseLeave={scheduleClose}
        />
      )}
    </div>
  );
};
