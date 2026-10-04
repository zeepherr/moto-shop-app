"use client";

import React from "react";
import { Package, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface PosModeSwitchProps {
  mode: "PRODUCT" | "SERVICE";
  onModeChange: (mode: "PRODUCT" | "SERVICE") => void;
}

export const PosModeSwitch: React.FC<PosModeSwitchProps> = ({ mode, onModeChange }) => {
  return (
    <div className="grid h-[52px] w-full grid-cols-2 gap-1 rounded-xl border border-border/70 bg-muted/60 p-1 min-[400px]:w-[164px] sm:h-11 sm:w-auto sm:min-w-52" role="group" aria-label="Browse catalog">
      <button
        type="button"
        onClick={() => onModeChange("PRODUCT")}
        aria-pressed={mode === "PRODUCT"}
        className={cn(
          "flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors sm:gap-2 sm:px-3 sm:text-sm",
          mode === "PRODUCT"
            ? "bg-card text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Package className="size-4" />
        Products
      </button>

      <button
        type="button"
        onClick={() => onModeChange("SERVICE")}
        aria-pressed={mode === "SERVICE"}
        className={cn(
          "flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors sm:gap-2 sm:px-3 sm:text-sm",
          mode === "SERVICE"
            ? "bg-card text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Wrench className="size-4" />
        Services
      </button>
    </div>
  );
};
