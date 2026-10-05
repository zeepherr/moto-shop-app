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
    <header className="management-page-header border-b border-border/60 py-3 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="sr-only min-[1536px]:not-sr-only min-[1536px]:block min-[1536px]:text-[1.75rem] min-[1536px]:font-semibold min-[1536px]:leading-tight min-[1536px]:tracking-[-0.025em] min-[1536px]:text-foreground">
              {title}
            </h1>
            {count !== undefined && (
              <span className="hidden min-w-7 items-center justify-center rounded-lg border border-border/70 bg-card px-2 py-1 text-xs font-semibold tabular-nums text-muted-foreground shadow-xs min-[1536px]:inline-flex">
                {count}
              </span>
            )}
          </div>
          <p className="max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
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
