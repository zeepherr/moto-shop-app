"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  count,
  actionLabel,
  onAction,
  children,
}) => {
  return (
    <div className="sticky top-1 z-20 bg-background/95 backdrop-blur-md pb-2 pt-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {count !== undefined && (
              <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/60 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                {count}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {children}
          {actionLabel && onAction && (
            <Button
              type="button"
              onClick={onAction}
              className="h-9 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white px-4 text-xs sm:text-sm font-medium gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="size-4" />
              <span>{actionLabel}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
