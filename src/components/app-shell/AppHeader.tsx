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
    <header className="absolute inset-x-3 top-3 z-30 flex h-14 items-center justify-between overflow-hidden rounded-2xl border border-border/80 bg-card/85 px-4 shadow-xs backdrop-blur-xl transition-colors sm:inset-x-5 sm:px-5 dark:border-white/[0.08] dark:bg-[linear-gradient(180deg,rgba(11,18,48,0.78),rgba(7,12,36,0.64))] dark:shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
      {/* Dark mode subtle highlights */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_14%_-40%,rgba(0,102,204,0.12),transparent_38%)] dark:block"
      />

      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="size-9 shrink-0 rounded-xl border border-border/70 bg-background/60 text-muted-foreground backdrop-blur-sm md:hidden hover:bg-muted hover:text-foreground cursor-pointer dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.08] dark:text-foreground"
        >
          <Menu className="size-4" />
        </Button>

        <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary sm:flex">
          HrungMoto
        </div>

        <span className="hidden h-4 w-px bg-border/80 sm:block" />

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
          className="size-9 rounded-xl border border-border/70 bg-background/60 text-muted-foreground backdrop-blur-sm transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95 cursor-pointer dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.08] dark:text-foreground"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4 text-foreground" />}
        </Button>
      </div>
    </header>
  );
};
