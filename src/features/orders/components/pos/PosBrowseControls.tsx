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
    <div className="flex shrink-0 items-center gap-2">
      <div className="min-w-0 flex-1">
        {mode === "PRODUCT" && (
          <PosCategories
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            isPending={isCategoriesPending}
          />
        )}
      </div>

      <div className="shrink-0 flex">
        <PosModeSwitch mode={mode} onModeChange={handleModeChange} />
      </div>
    </div>
  );
};
