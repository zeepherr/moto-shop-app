"use client";

import React, { useRef } from "react";
import { ImageOff, Plus, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePosStore } from "../../stores/usePosStore";
import { productToCartItem } from "../../utils/cart.util";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface PosProduct {
  id: number;
  sku: string;
  name: string;
  sellingPrice: number | string | { toString: () => string };
  stockQuantity: number;
  unit?: string | null;
  imageKey?: string | null;
  imageUrl?: string | null;
  productCategoryId?: number | null;
  productCategory?: { name: string } | null;
}

interface PosProductCardProps {
  product: PosProduct;
  onProductAdded?: (imageElement: HTMLImageElement | null) => void;
}

export const PosProductCard: React.FC<PosProductCardProps> = ({ product, onProductAdded }) => {
  const addItem = usePosStore((store) => store.addItem);
  const imageRef = useRef<HTMLImageElement>(null);

  const stock = Number(product.stockQuantity) || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const price = Number(product.sellingPrice) || 0;

  const handleAddProduct = () => {
    if (isOutOfStock) {
      toast.warning("Insufficient stock!");
      return;
    }

    const cartItem = productToCartItem(product);
    const added = addItem(cartItem);

    if (!added) {
      toast.warning("Maximum available stock reached.");
      return;
    }

    onProductAdded?.(imageRef.current);
  };

  return (
    <article
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card transition-colors duration-200 ease-out sm:rounded-2xl",
        !isOutOfStock && "hover:border-primary/30",
        isOutOfStock && "opacity-60",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border/60 bg-white sm:aspect-4/3 sm:bg-muted/30">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            ref={imageRef}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-1.5 transition-transform duration-200 ease-out group-hover:scale-[1.025] sm:object-cover sm:p-0"
          />
        ) : (
            <div className="flex h-full w-full items-center justify-center bg-background/40 text-muted-foreground">
            <ImageOff className="size-7 stroke-[1.6]" />
          </div>
        )}

        {(isLowStock || isOutOfStock) && (
          <span
            className={cn(
              "absolute right-2 top-2 rounded-full border bg-background/90 px-2 py-1 text-[11px] font-semibold",
              isOutOfStock
                ? "border-destructive/20 bg-destructive/10 text-destructive"
                : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
            )}
          >
            {isOutOfStock ? "Out of stock" : "Low stock"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2 sm:p-3.5">
        <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
          {product.sku}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-9 text-sm font-semibold leading-[1.125rem] text-foreground sm:min-h-10 sm:leading-5">
          {product.name}
        </h3>

        {product.productCategory?.name && (
          <p className="mt-1 hidden truncate text-xs text-muted-foreground sm:block">
            {product.productCategory.name}
          </p>
        )}

        <div className="mt-auto pt-2 sm:pt-4">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                <span className="text-accent">฿ </span>
                {price.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </p>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <PackageCheck className="size-3.5" />
                <span>
                  {stock} {product.unit ?? "in stock"}
                </span>
              </div>
            </div>

            <Button
              type="button"
              size="icon"
              disabled={isOutOfStock}
              onClick={handleAddProduct}
              className="size-11 shrink-0 cursor-pointer rounded-xl shadow-xs"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};
