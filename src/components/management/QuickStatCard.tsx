import React from "react";

interface QuickStatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  tone?: "default" | "blue" | "success" | "warning";
  compactOnMobile?: boolean;
}

const toneStyles = {
  default: "text-muted-foreground bg-muted/60 border-border/70",
  blue: "text-[#2997ff] bg-[#0066cc]/10 border-[#0066cc]/20",
  success: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
};

export const QuickStatCard: React.FC<QuickStatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  tone = "default",
  compactOnMobile = false,
}) => {
  const compact = compactOnMobile;
  return (
    <div className={`rounded-2xl border border-border/70 bg-card shadow-xs transition-colors hover:border-border ${compact ? "p-3 sm:p-4" : "p-4"}`}>
      <div className={`flex items-center justify-between ${compact ? "gap-2 sm:gap-3" : "gap-3"}`}>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {icon && (
          <div
            className={`flex shrink-0 items-center justify-center rounded-xl border ${compact ? "size-7 sm:size-8" : "size-8"} ${toneStyles[tone]}`}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`font-semibold tracking-tight text-foreground tabular-nums ${compact ? "break-words text-xl sm:text-2xl" : "text-2xl"}`}>
          {value}
        </span>
      </div>
      {subtext && (
        <p className={`mt-1 text-muted-foreground ${compact ? "text-xs leading-4" : "text-xs"}`}>{subtext}</p>
      )}
    </div>
  );
};
