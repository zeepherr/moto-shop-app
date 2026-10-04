"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import type { AuthUserDTO } from "@/features/auth/types";
import { getMobileTabs, getMoreNavigation } from "./navigation.config";
import { isNavItemActive } from "./nav-utils";
import { MobileMoreSheet } from "./MobileMoreSheet";
import { MobileSettingsSheet } from "./MobileSettingsSheet";

export function MobileTabBar({ user }: { user: AuthUserDTO | null }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const tabs = getMobileTabs(user?.role ?? "ADMIN");
  const moreItems = getMoreNavigation("ADMIN");
  const moreActive = moreItems.some((item) => isNavItemActive(pathname, item));

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[0_-4px_16px_color-mix(in_srgb,var(--foreground)_6%,transparent)] pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="grid h-16 grid-cols-6 items-center px-1">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = !settingsOpen && (item.mobile === "more" ? moreActive : isNavItemActive(pathname, item));
            const activeClass = active ? "text-primary" : "text-muted-foreground";

            if (item.mobile === "center") {
              return (
                <motion.div key={item.label} whileTap={{ scale: 0.92 }} className="flex h-16 items-center justify-center">
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    className="-translate-y-3.5 flex size-[52px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
                  >
                    <Icon className="size-6 stroke-[1.8]" />
                  </Link>
                </motion.div>
              );
            }

            if (item.mobile === "more") {
              return (
                <motion.button
                  key={item.label}
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setMoreOpen(true)}
                  aria-label="More admin pages"
                  aria-expanded={moreOpen}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeClass}`}
                >
                  {active && <motion.span layoutId="mobile-tab-indicator" className="absolute -top-1 h-1 w-5 rounded-full bg-primary" />}
                  <Icon className="size-[23px] stroke-[1.8]" />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </motion.button>
              );
            }

            if (item.mobile === "settings") {
              return (
                <motion.button
                  key={item.label}
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSettingsOpen(true)}
                  aria-label="Settings"
                  aria-expanded={settingsOpen}
                  className={`relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${settingsOpen ? "text-primary" : "text-muted-foreground"}`}
                >
                  {settingsOpen && <motion.span layoutId="mobile-tab-indicator" className="absolute -top-1 h-1 w-5 rounded-full bg-primary" />}
                  <Icon className="size-[23px] stroke-[1.8]" />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </motion.button>
              );
            }

            return (
              <motion.div key={item.href} whileTap={{ scale: 0.92 }}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeClass}`}
                >
                  {active && <motion.span layoutId="mobile-tab-indicator" className="absolute -top-1 h-1 w-5 rounded-full bg-primary" />}
                  <Icon className="size-[23px] stroke-[1.8]" />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>
      <MobileMoreSheet open={moreOpen} onOpenChange={setMoreOpen} user={user} />
      <MobileSettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
