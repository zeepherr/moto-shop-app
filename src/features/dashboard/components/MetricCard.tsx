import React from "react";
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
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  trend,
  tone = "blue",
  icon,
}) => {
  const iconTones = {
    primary: "bg-[#0066cc]/10 text-[#2997ff] border-[#0066cc]/20",
    blue: "bg-[#0066cc]/10 text-[#2997ff] border-[#0066cc]/20",
    warning: "bg-destructive/10 text-destructive border-destructive/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <div className="group relative rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md p-5 transition-all duration-200 hover:border-border hover:bg-card/80">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-full border transition-transform duration-200 group-hover:scale-105",
              iconTones[tone]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </p>

        <div className="mt-2 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border",
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              )}
            >
              {trend.value}
            </span>
          )}
          {subtext && (
            <span className="text-xs text-muted-foreground truncate">
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
