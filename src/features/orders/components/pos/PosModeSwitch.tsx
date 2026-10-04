"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PosModeSwitchProps {
  mode: "PRODUCT" | "SERVICE";
  onModeChange: (mode: "PRODUCT" | "SERVICE") => void;
}

export const PosModeSwitch: React.FC<PosModeSwitchProps> = ({ mode, onModeChange }) => {
  return (
    <div className="grid h-11 w-full grid-cols-2 sm:w-auto" role="group" aria-label="Browse catalog">
      <button
        type="button"
        onClick={() => onModeChange("PRODUCT")}
        aria-pressed={mode === "PRODUCT"}
        className={cn(
          "h-11 min-w-0 cursor-pointer rounded-md px-3 text-xs font-medium transition-colors sm:min-w-24 sm:text-sm",
          mode === "PRODUCT"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Products
      </button>

      <button
        type="button"
        onClick={() => onModeChange("SERVICE")}
        aria-pressed={mode === "SERVICE"}
        className={cn(
          "h-11 min-w-0 cursor-pointer rounded-md px-3 text-xs font-medium transition-colors sm:min-w-24 sm:text-sm",
          mode === "SERVICE"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Services
      </button>
    </div>
  );
};
