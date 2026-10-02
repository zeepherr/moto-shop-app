import React from "react";

interface QuickStatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  tone?: "default" | "blue" | "success" | "warning";
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
}) => {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-colors hover:border-border">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {icon && (
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-xl border ${toneStyles[tone]}`}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {value}
        </span>
      </div>
      {subtext && (
        <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
};
