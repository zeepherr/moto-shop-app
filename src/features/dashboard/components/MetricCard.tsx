import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  tone?: "primary" | "blue" | "warning" | "success";
  icon?: React.ReactNode;
  href?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  trend,
  tone = "blue",
  icon,
  href,
}) => {
  const iconTones = {
    primary: "bg-[#0066cc]/10 text-[#2997ff] border-[#0066cc]/20",
    blue: "bg-[#0066cc]/10 text-[#2997ff] border-[#0066cc]/20",
    warning: "bg-destructive/10 text-destructive border-destructive/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  const card = (
    <div className="group relative rounded-2xl border border-border/70 bg-card/60 p-3.5 backdrop-blur-md transition-all duration-200 hover:border-border hover:bg-card/80 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {icon && (
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full border transition-transform duration-200 group-hover:scale-105 sm:size-9",
                iconTones[tone]
              )}
            >
              {icon}
            </div>
          )}
          {href && <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />}
        </div>
      </div>

      <div className="mt-2 sm:mt-3">
        <p className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {value}
        </p>

        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5 sm:mt-2 sm:flex-nowrap sm:gap-2">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              )}
            >
              {trend.value}
            </span>
          )}
          {subtext && (
            <span className="min-w-0 text-xs leading-4 text-muted-foreground sm:truncate">
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{card}</Link> : card;
};
