"use client";

import React from "react";
import { ChevronRight, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";

interface AppHeaderProps {
  section?: string;
  title?: string;
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
  hideOnMobile?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  section = "Shop Management",
  title = "Dashboard",
  onMenuClick,
  showMobileMenu = true,
  hideOnMobile = false,
}) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <header className={`absolute inset-x-0 top-0 z-30 h-16 items-center justify-between border-b border-border/70 bg-background px-3 sm:px-6 ${hideOnMobile ? "hidden min-[1536px]:flex" : "flex"}`}>
      <div className="flex min-w-0 items-center gap-3">
        {showMobileMenu && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="size-10 shrink-0 rounded-xl text-muted-foreground md:hidden hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <Menu className="size-5" />
          </Button>
        )}

        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2.5 text-sm">
          <span className="hidden text-xs font-medium text-muted-foreground sm:inline">{section}</span>
          <ChevronRight className="hidden size-3.5 text-muted-foreground/50 sm:block" />
          <span className="truncate font-semibold tracking-[-0.01em] text-foreground">{title}</span>
        </nav>
      </div>

      <div className="flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={isDark ? "Use light theme" : "Use dark theme"}
          title={isDark ? "Use light theme" : "Use dark theme"}
          className="size-10 rounded-xl border border-border/70 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 cursor-pointer"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4 text-foreground" />}
        </Button>
      </div>
    </header>
  );
};
