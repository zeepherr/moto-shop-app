"use client";

import React from "react";
import { PosCategories } from "./PosCategories";
import { PosModeSwitch } from "./PosModeSwitch";

interface PosBrowseControlsProps {
  mode: "PRODUCT" | "SERVICE";
  onModeChange: (mode: "PRODUCT" | "SERVICE") => void;
  categories?: Array<{ id: number; name: string }>;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isCategoriesPending?: boolean;
}

export const PosBrowseControls: React.FC<PosBrowseControlsProps> = ({
  mode,
  onModeChange,
  categories = [],
  selectedCategory,
  onCategoryChange,
  isCategoriesPending = false,
}) => {
  const handleModeChange = (newMode: "PRODUCT" | "SERVICE") => {
    if (newMode === mode) return;
    onModeChange(newMode);
    onCategoryChange("all");
  };

  return (
    <div className="flex shrink-0 flex-col gap-2 min-[400px]:flex-row min-[400px]:items-center sm:flex-row sm:items-center sm:gap-2">
      <div className="order-last min-w-0 min-[400px]:order-first min-[400px]:flex-1">
        {mode === "PRODUCT" && (
          <PosCategories
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            isPending={isCategoriesPending}
          />
        )}
      </div>

      <div className="order-first flex w-full shrink-0 min-[400px]:order-last min-[400px]:w-[164px] sm:order-last sm:w-auto">
        <PosModeSwitch mode={mode} onModeChange={handleModeChange} />
      </div>
    </div>
  );
};
