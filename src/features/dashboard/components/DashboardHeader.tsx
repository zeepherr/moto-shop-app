"use client";

import React from "react";
import Link from "next/link";
import { Plus, ShoppingBag, ArrowUpRight } from "lucide-react";

export const DashboardHeader: React.FC = () => {
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="dashboard-page-header flex flex-col gap-3 pb-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-2">
      <div className="min-w-0">
        <p className="mb-1 hidden text-xs font-medium text-muted-foreground min-[1536px]:block">{currentDate}</p>
        <h1 className="dashboard-page-title sr-only min-[1536px]:not-sr-only min-[1536px]:block min-[1536px]:text-2xl min-[1536px]:font-semibold min-[1536px]:tracking-tight min-[1536px]:text-foreground">
          Workshop Cockpit
        </h1>
        <p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:mt-0.5 sm:text-sm min-[1536px]:block">
          Real-time metrics, revenue performance, and inventory health
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center sm:gap-2.5">
        <Link
          href="/admin/products"
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-md transition-all hover:bg-muted/80 active:scale-95 sm:px-4 sm:text-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Product</span>
        </Link>
        <Link
          href="/admin/pos"
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-[#0066cc] px-3 py-2 text-xs font-medium text-white shadow-xs transition-all hover:bg-[#0071e3] active:scale-95 sm:gap-2 sm:px-5 sm:text-sm"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Launch POS</span>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
        </Link>
      </div>
    </div>
  );
};
