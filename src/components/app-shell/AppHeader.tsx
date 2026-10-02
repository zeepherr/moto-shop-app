"use client";

import React from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";

interface AppHeaderProps {
  section?: string;
  title?: string;
  onMenuClick: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  section = "Shop Management",
  title = "Dashboard",
  onMenuClick,
}) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <header className="absolute inset-x-3 top-3 z-30 flex h-14 items-center justify-between overflow-hidden rounded-2xl border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(11,18,48,0.78),rgba(7,12,36,0.64))] px-4 shadow-[0_16px_40px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[18px] backdrop-saturate-[125%] sm:inset-x-5 sm:px-5">
      {/* Glass highlights & refractions */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_-40%,rgba(34,211,238,0.10),transparent_38%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_140%,rgba(59,130,246,0.08),transparent_42%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-12 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/10 to-transparent"
      />

      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="size-9 shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.03] text-muted-foreground backdrop-blur-sm md:hidden hover:border-cyan-300/15 hover:bg-cyan-300/[0.06] hover:text-foreground cursor-pointer"
        >
          <Menu className="size-4" />
        </Button>

        <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent sm:flex">
          HrungMoto
        </div>

        <span className="hidden h-4 w-4/12 max-w-[1px] bg-border/70 sm:block" />

        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-xs">
          <span className="text-muted-foreground">{section}</span>
          <span className="text-border">/</span>
          <span className="truncate font-semibold text-foreground">{title}</span>
        </nav>
      </div>

      {/* Right: Theme Toggle */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="size-9 rounded-xl border border-white/[0.06] bg-white/[0.025] text-muted-foreground backdrop-blur-sm transition-all duration-200 hover:border-cyan-300/15 hover:bg-cyan-400/[0.05] hover:text-foreground hover:shadow-[0_0_20px_rgba(34,211,238,0.08)] cursor-pointer"
        >
          {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </Button>
      </div>
    </header>
  );
};
