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
  compactOnMobile?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  count,
  actionLabel,
  onAction,
  children,
  compactOnMobile = false,
}) => {
  const compact = compactOnMobile;
  return (
    <header className={`management-page-header border-b border-border/60 ${compact ? "pb-4 pt-3 sm:pb-6 sm:pt-6" : "pb-5 pt-5 sm:pb-6 sm:pt-6"}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className={`font-semibold leading-tight tracking-[-0.025em] text-foreground ${compact ? "text-2xl sm:text-[1.75rem]" : "text-[1.75rem]"}`}>
              {title}
            </h1>
            {count !== undefined && (
              <span className="inline-flex min-w-7 items-center justify-center rounded-lg border border-border/70 bg-card px-2 py-1 text-xs font-semibold tabular-nums text-muted-foreground shadow-xs">
                {count}
              </span>
            )}
          </div>
          <p className={`mt-1.5 max-w-2xl leading-5 text-muted-foreground ${compact ? "text-xs sm:text-sm" : "text-sm"}`}>
            {description}
          </p>
        </div>

        <div className={`flex shrink-0 items-center gap-2 ${compact ? "w-full flex-col items-stretch [&>*]:w-full sm:w-auto sm:flex-row sm:items-center sm:[&>*]:w-auto" : ""}`}>
          {children}
          {actionLabel && onAction && (
            <Button
              type="button"
              onClick={onAction}
              className={`h-10 rounded-xl bg-[#0066cc] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0071e3] active:scale-[0.98] cursor-pointer ${compact ? "w-full justify-center sm:w-auto" : ""}`}
            >
              <Plus className="size-4" />
              <span>{actionLabel}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
