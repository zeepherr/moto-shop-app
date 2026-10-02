"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductHeaderProps {
  onAddProduct: () => void;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({ onAddProduct }) => {
  return (
    <div className="sticky top-1 z-20 bg-background/95 backdrop-blur-md pb-2">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Products
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your shop products, pricing and inventory
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={onAddProduct}
          className="h-8 shrink-0 cursor-pointer gap-1.5 px-3 text-xs sm:h-9 sm:text-sm"
        >
          <Plus className="size-3.5 sm:size-4" />
          Add Product
        </Button>
      </div>
    </div>
  );
};
