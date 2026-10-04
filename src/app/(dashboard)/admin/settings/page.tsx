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
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Dark theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${isDark ? "bg-primary" : "bg-muted-foreground/40"}`}
          >
            <span
              className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${isDark ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
        <p className="p-5 text-sm text-muted-foreground sm:p-6">
          Additional shop settings are coming soon.
        </p>
      </section>
    </ManagementLayout>
  );
}
