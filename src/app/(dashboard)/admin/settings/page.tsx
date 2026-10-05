"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";

export default function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ManagementLayout>
      <PageHeader
        title="Settings"
        description="Shop and account preferences"
      />
      <section className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card">
        <div className="flex items-center gap-4 p-5 sm:p-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">Appearance</span>
            <span className="block text-sm text-muted-foreground">
              {isDark ? "Dark theme" : "Light theme"}
            </span>
          </span>
          <div
            role="group"
            aria-label="Color theme"
            className="grid h-11 shrink-0 grid-cols-2 gap-1 rounded-full border border-border/70 bg-muted/60 p-1"
          >
            <button
              type="button"
              aria-pressed={!isDark}
              onClick={() => setTheme("light")}
              className={`rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${!isDark ? "bg-card text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Light
            </button>
            <button
              type="button"
              aria-pressed={isDark}
              onClick={() => setTheme("dark")}
              className={`rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isDark ? "bg-card text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Dark
            </button>
          </div>
        </div>
        <p className="p-5 text-sm text-muted-foreground sm:p-6">
          Additional shop settings are coming soon.
        </p>
      </section>
    </ManagementLayout>
  );
}
