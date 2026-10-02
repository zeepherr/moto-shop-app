"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryItem {
  id: number;
  name: string;
}

interface PosCategoriesProps {
  categories?: CategoryItem[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  isPending?: boolean;
}

export const PosCategories: React.FC<PosCategoriesProps> = ({
  categories = [],
  selectedCategory,
  onCategoryChange,
  isPending = false,
}) => {
  if (isPending) {
    return (
      <div className="flex h-9 items-center text-sm text-muted-foreground">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="flex h-9 gap-1.5 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
      <Button
        type="button"
        size="sm"
        variant={selectedCategory === "all" ? "default" : "outline"}
        onClick={() => onCategoryChange("all")}
        className="h-8 shrink-0 cursor-pointer px-3"
      >
        All
      </Button>

      {categories.map((category) => {
        const isSelected = String(category.id) === String(selectedCategory);

        return (
          <Button
            key={category.id}
            type="button"
            size="sm"
            variant={isSelected ? "default" : "outline"}
            onClick={() => onCategoryChange(String(category.id))}
            className={cn(
              "h-8 shrink-0 cursor-pointer px-3",
              !isSelected && "text-muted-foreground",
            )}
          >
            {category.name}
          </Button>
        );
      })}
    </div>
  );
};
