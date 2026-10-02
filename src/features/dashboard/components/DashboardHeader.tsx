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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Shop Open
          </span>
          <span className="text-xs text-muted-foreground">{currentDate}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Workshop Cockpit
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Real-time metrics, revenue performance, and inventory health
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-muted/80 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Product</span>
        </Link>
        <Link
          href="/admin/pos"
          className="inline-flex items-center gap-2 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white px-5 py-2 text-xs sm:text-sm font-medium shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Launch POS</span>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
        </Link>
      </div>
    </div>
  );
};
