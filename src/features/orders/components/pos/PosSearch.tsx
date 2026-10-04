"use client";

import React, { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    const focusScanner = (event: KeyboardEvent) => {
      if (event.key !== "F2" || event.repeat || event.defaultPrevented) return;
      if (document.visibilityState !== "visible") return;
      const target = event.target;
      if (target instanceof HTMLElement && (
        target.isContentEditable
        || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
        || target.closest('[data-pos-modal="true"]')
      )) return;
      if (document.querySelector('[data-pos-modal="true"]')) return;
      event.preventDefault();
      skuRef.current?.focus();
    };
    window.addEventListener("keydown", focusScanner);
    return () => window.removeEventListener("keydown", focusScanner);
  }, []);

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
    <section aria-label="Find an item" className="grid shrink-0 grid-cols-1 gap-2.5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <label className="relative block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products or services"
          aria-label="Search products or services"
          className="h-12 rounded-xl border border-input bg-card pl-10 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
        />
      </label>

      <label className="relative block">
        <Barcode className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={skuRef}
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onKeyDown={handleSkuSubmit}
          placeholder="Scan or enter SKU"
          aria-label="Scan or enter product SKU. Press F2 to focus, then Enter to add the exact SKU."
          aria-keyshortcuts="F2"
          autoComplete="off"
          className="h-12 rounded-xl border border-input bg-card pl-10 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
        />
        <p className="sr-only">Press F2 to focus the scanner. Press Enter after scanning to add the matching product.</p>
      </label>
    </section>
  );
};
