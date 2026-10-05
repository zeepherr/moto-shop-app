"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import type { AuthUserDTO } from "@/features/auth/types";
import { getMobileTabs, getMoreNavigation } from "./navigation.config";
import { isNavItemActive } from "./nav-utils";
import { MobileMoreSheet } from "./MobileMoreSheet";

export function MobileTabBar({ user }: { user: AuthUserDTO | null }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const tabs = getMobileTabs(user?.role ?? "ADMIN");
  const isAdmin = user?.role === "ADMIN";
  const moreItems = getMoreNavigation(user?.role ?? "ADMIN");
  const moreActive = moreOpen || moreItems.some((item) => isNavItemActive(pathname, item));

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 md:hidden"
      >
        <div className="relative isolate overflow-visible rounded-full border border-white/55 bg-white/75 text-sidebar-foreground shadow-[0_14px_38px_rgba(15,23,42,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-150 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-white/25 dark:border-white/15 dark:bg-sidebar/80 dark:after:ring-white/10">
        <div className={`grid h-[64px] items-center px-1.5 ${isAdmin ? "grid-cols-5" : "grid-cols-3"}`}>
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = item.mobile === "more" ? moreActive : isNavItemActive(pathname, item);
            const activeClass = active ? "text-primary-foreground dark:text-[#071a2d]" : "text-muted-foreground";
            const tabContents = (
              <>
                {active && (
                  <motion.span
                    layoutId="mobile-tab-indicator"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-x-1 inset-y-1 rounded-full bg-primary shadow-[0_3px_10px_color-mix(in_srgb,var(--primary)_35%,transparent)]"
                  />
                )}
                <Icon className="relative z-10 size-[22px] stroke-[1.8]" />
                <span className={`relative z-10 text-[11px] ${active ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              </>
            );

            if (item.mobile === "more") {
              return (
                <motion.button
                  key={item.label}
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setMoreOpen(true)}
                  aria-label="More pages"
                  aria-haspopup="dialog"
                  aria-expanded={moreOpen}
                  className={`relative flex w-full min-h-12 flex-col items-center justify-center gap-1 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeClass}`}
                >
                  {tabContents}
                </motion.button>
              );
            }

            return (
              <motion.div key={item.href} whileTap={{ scale: 0.94 }}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex w-full min-h-12 flex-col items-center justify-center gap-1 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeClass}`}
                >
                  {tabContents}
                </Link>
              </motion.div>
            );
          })}
        </div>
        </div>
      </nav>
      <MobileMoreSheet open={moreOpen} onOpenChange={setMoreOpen} user={user} />
    </>
  );
}
