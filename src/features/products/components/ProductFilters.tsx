"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ProductDTO } from "../types";

interface ProductFiltersProps {
  products: ProductDTO[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  hasActiveFilters: boolean;
  handleClearFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  products,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  hasActiveFilters,
  handleClearFilters,
}) => {
  const categories = [
    ...new Map(
      products
        ?.map((p) => p.productCategory)
        .filter(Boolean)
        .map((cat) => [cat!.id, cat!]),
    ).values(),
  ];

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:min-w-64 sm:flex-1 sm:max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search product name or SKU..."
          className="h-10 rounded-xl border border-input bg-card pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
        />
      </div>

      <Select
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        options={[
          { value: "all", label: "All categories" },
          ...categories.map((category) => ({ value: String(category.id), label: category.name })),
        ]}
        className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus:ring-2 focus:ring-primary sm:w-44 cursor-pointer"
      />

      <Select
        value={selectedStatus}
        onValueChange={setSelectedStatus}
        options={[
          { value: "all", label: "All status" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
        className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus:ring-2 focus:ring-primary sm:w-36 cursor-pointer"
      />

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
        >
          <X className="size-4" />
          Clear
        </Button>
      )}
    </div>
  );
};
