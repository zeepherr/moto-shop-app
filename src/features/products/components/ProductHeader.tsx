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
          onClick={onAddProduct}
          className="h-9 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white px-4 text-xs sm:text-sm font-medium gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Add Product</span>
        </Button>
      </div>
    </div>
  );
};
