"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FilterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  status?: string;
  onStatusChange?: (value: string) => void;
  statusCounts?: { all?: number; active?: number; inactive?: number };
  children?: React.ReactNode;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  status,
  onStatusChange,
  statusCounts,
  children,
  hasActiveFilters,
  onClearFilters,
}) => {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:max-w-2xl">
        {/* Search Input */}
        <div className="relative w-full sm:min-w-64 sm:flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 rounded-xl border border-input bg-card pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
          />
        </div>

        {/* Children (additional selects/filters) */}
        {children}
      </div>

      {/* Segmented Status Tabs or Clear Button */}
      <div className="flex items-center gap-2">
        {status !== undefined && onStatusChange && (
          <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/50 text-xs">
            {[
              { value: "all", label: "All", count: statusCounts?.all },
              { value: "active", label: "Active", count: statusCounts?.active },
              { value: "inactive", label: "Inactive", count: statusCounts?.inactive },
            ].map((tab) => {
              const isActive = status === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onStatusChange(tab.value)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.value === "active" && (
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                  )}
                  {tab.value === "inactive" && (
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                  )}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] tabular-nums rounded px-1 py-0.2 ${
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {hasActiveFilters && onClearFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
          >
            <X className="size-3.5" />
            <span>Clear</span>
          </Button>
        )}
      </div>
    </div>
  );
};
