"use client";

import { Moon, Sun } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useTheme } from "@/components/theme/ThemeProvider";

interface MobileSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSettingsSheet({ open, onOpenChange }: MobileSettingsSheetProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[70dvh] rounded-t-3xl border-x-0 border-b-0 border-t border-sidebar-border bg-sidebar pb-[env(safe-area-inset-bottom)] text-sidebar-foreground"
      >
        <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-muted-foreground/30" aria-hidden="true" />
        <div className="px-5 pb-6 pt-4">
          <SheetTitle className="mb-5 text-base">Settings</SheetTitle>
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">Appearance</span>
              <span className="block text-xs text-muted-foreground">{isDark ? "Dark theme" : "Light theme"}</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              aria-label="Dark theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`relative h-7 w-12 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${isDark ? "bg-primary" : "bg-muted-foreground/40"}`}
            >
              <span
                className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${isDark ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
