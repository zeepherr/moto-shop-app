"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import type { AuthUserDTO } from "@/features/auth/types";
import { getMoreNavigation } from "./navigation.config";
import { isNavItemActive } from "./nav-utils";

interface MobileMoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUserDTO | null;
}

export function MobileMoreSheet({ open, onOpenChange, user }: MobileMoreSheetProps) {
  const pathname = usePathname();
  const items = getMoreNavigation("ADMIN");
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "Administrator";
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "A";
  const roleName = user?.role === "STAFF" ? "Staff" : user?.role === "MEMBER" ? "Member" : "Administrator";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] rounded-t-3xl border-x-0 border-b-0 border-t border-sidebar-border bg-sidebar pb-[env(safe-area-inset-bottom)] text-sidebar-foreground"
      >
        <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-muted-foreground/30" aria-hidden="true" />
        <div className="px-5 pb-5 pt-4">
          <SheetTitle className="mb-5 text-base">More</SheetTitle>
          <nav aria-label="More admin pages" className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isNavItemActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-primary/30 bg-primary/10 text-primary" : "border-border/60 bg-card text-muted-foreground hover:bg-muted"}`}
                >
                  <Icon className="size-6 stroke-[1.8]" />
                  <span className="text-xs font-medium leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="my-5 border-t border-border/70" />

          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">{fullName}</span>
              <span className="block text-xs text-muted-foreground">{roleName}</span>
            </span>
            <LogoutButton className="min-h-11 shrink-0 cursor-pointer gap-2 border-destructive/30 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
