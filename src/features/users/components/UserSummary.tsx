"use client";

import React from "react";
import { ShieldCheck, UserRound, UsersRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  primary: {
    icon: "bg-primary/10 text-primary",
    bar: "bg-primary",
    glow: "from-primary/[0.06]",
  },
  neutral: {
    icon: "bg-muted text-muted-foreground",
    bar: "bg-muted-foreground/50",
    glow: "from-muted/60",
  },
};

interface SummaryCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  percentage?: number;
  tone?: "primary" | "neutral";
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  percentage,
  tone = "neutral",
}: SummaryCardProps) {
  const styles = tones[tone];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-70",
          styles.glow,
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
          </div>

          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
              styles.icon,
            )}
          >
            <Icon className="size-5 stroke-[1.8]" />
          </div>
        </div>

        {percentage !== undefined && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Of total users</span>
              <span className="text-xs font-medium text-foreground">{percentage}%</span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-[width] duration-300", styles.bar)}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface UserSummaryProps {
  totalUsers: number;
  memberCount: number;
  staffCount: number;
}

export const UserSummary: React.FC<UserSummaryProps> = ({
  totalUsers,
  memberCount,
  staffCount,
}) => {
  const getPercentage = (value: number) => {
    if (!totalUsers) return 0;
    return Math.round((value / totalUsers) * 100);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SummaryCard
        label="Total Users"
        value={totalUsers}
        icon={UsersRound}
        tone="primary"
      />

      <SummaryCard
        label="Members"
        value={memberCount}
        icon={UserRound}
        percentage={getPercentage(memberCount)}
      />

      <SummaryCard
        label="Staff"
        value={staffCount}
        icon={ShieldCheck}
        percentage={getPercentage(staffCount)}
        tone="primary"
      />
    </div>
  );
};
