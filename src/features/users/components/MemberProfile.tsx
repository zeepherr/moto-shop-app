"use client";

import { Moon, Sun, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { MemberPersonalDetails } from "./MemberPersonalDetails";
import { MemberEmailChange } from "./MemberEmailChange";
import { MemberPasswordChange } from "./MemberPasswordChange";
import { MemberMotorcycles } from "./MemberMotorcycles";
import { MemberOrderHistory } from "./MemberOrderHistory";
import type { MemberProfileData } from "./member-profile.types";

export function MemberProfile({ user }: { user: MemberProfileData }) {
  const { theme, setTheme } = useTheme();
  const joinedAt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date(user.createdAt));
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-7 sm:pt-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-border/70 pb-5">
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">HurngMoto</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Member account</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" className="size-11 rounded-full" aria-label={theme === "dark" ? "Use light theme" : "Use dark theme"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
            </Button>
            <LogoutButton className="min-h-11 gap-2 rounded-full px-4" />
          </div>
        </header>

        <section className="grid gap-6 py-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:py-9">
          <div>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">Your account</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Review your workshop details, motorcycle, and service history.</p>
            <p className="mt-3 text-sm text-muted-foreground">Member #{user.id} <span aria-hidden="true">·</span> Joined {joinedAt}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[19rem]">
            <div className="rounded-2xl border border-border/70 bg-card p-4"><p className="text-2xl font-semibold tabular-nums text-foreground">{user.stats.totalVisits}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Wrench className="size-3.5" aria-hidden="true" />Completed visits</p></div>
            <div className="rounded-2xl border border-border/70 bg-card p-4"><p className="text-2xl font-semibold tabular-nums text-foreground">{user.orders.length}</p><p className="mt-1 text-xs text-muted-foreground">Total orders</p></div>
          </div>
        </section>

        <div className="grid gap-x-10 gap-y-9 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="min-w-0 divide-y divide-border/70">
            <MemberPersonalDetails user={user} />
            <MemberEmailChange currentEmail={user.email ?? ""} emailVerified={Boolean(user.emailVerifiedAt)} resendCooldownSeconds={user.emailResendCooldownSeconds} expiresSeconds={user.emailChangeExpiresSeconds} pendingRequest={user.emailChangeRequest} />
            <MemberPasswordChange currentEmail={user.email ?? ""} />
          </div>
          <div className="min-w-0 space-y-9">
            <MemberMotorcycles motors={user.userMotors} suggestions={user.motorSuggestions} />
            <MemberOrderHistory orders={user.orders} totalSpent={user.stats.totalSpent} />
          </div>
        </div>
      </div>
    </div>
  );
}
