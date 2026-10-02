"use client";

import React, { useRef, useState } from "react";
import { Barcode, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePosStore } from "../../stores/usePosStore";
import { productToCartItem } from "../../utils/cart.util";
import { toast } from "sonner";

interface PosSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  products: Array<{
    id: number;
    sku: string;
    name: string;
    sellingPrice: number | string | { toString: () => string };
    stockQuantity: number;
    imageKey?: string | null;
  }>;
}

export const PosSearch: React.FC<PosSearchProps> = ({
  searchTerm,
  onSearchChange,
  products = [],
}) => {
  const addItem = usePosStore((store) => store.addItem);
  const [sku, setSku] = useState("");
  const skuRef = useRef<HTMLInputElement>(null);

  const handleSkuSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    const value = sku.trim().toLowerCase();
    if (!value) return;

    const product = products.find(
      (p) => p.sku?.toLowerCase() === value,
    );

    if (!product) {
      toast.warning("Product not found");
      return;
    }

    if (Number(product.stockQuantity) <= 0) {
      toast.warning("Product is out of stock.");
      return;
    }

    const added = addItem(productToCartItem(product));
    if (!added) {
      toast.warning("Maximum available stock reached.");
      return;
    }

    setSku("");
    requestAnimationFrame(() => skuRef.current?.focus());
  };

  return (
    <section className="grid shrink-0 grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_280px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products or services..."
          className="h-9 pl-9"
        />
      </div>

      <div className="relative">
        <Barcode className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={skuRef}
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onKeyDown={handleSkuSubmit}
          placeholder="Scan or enter SKU"
          autoComplete="off"
          className="h-9 pl-9"
        />
      </div>
    </section>
  );
};
