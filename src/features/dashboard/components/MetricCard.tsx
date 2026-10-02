import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  tone?: "primary" | "cyan" | "warning" | "success";
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  tone = "primary",
  icon,
}) => {
  const toneClasses = {
    primary: "border-primary/20 text-primary",
    cyan: "border-accent/20 text-accent",
    warning: "border-destructive/20 text-destructive",
    success: "border-success/20 text-success",
  };

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {icon && <div className={cn("p-2 rounded-xl bg-card border", toneClasses[tone])}>{icon}</div>}
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
          {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
