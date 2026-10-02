"use client";

import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePosStore } from "../../stores/usePosStore";
import type { PosCartItem as PosCartItemType } from "../../types";

interface PosCartItemProps {
  item: PosCartItemType;
}

export const PosCartItem: React.FC<PosCartItemProps> = ({ item }) => {
  const increaseQuantity = usePosStore((store) => store.increaseQuantity);
  const decreaseQuantity = usePosStore((store) => store.decreaseQuantity);
  const removeItem = usePosStore((store) => store.removeItem);

  const price = item.unitPrice ?? item.price;
  const lineTotal = price * item.quantity;

  return (
    <div className="flex gap-2 border-b border-border/50 py-2 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {item.itemType}
            </p>
          </div>

          <p className="shrink-0 text-sm font-semibold text-foreground">
            ฿{lineTotal.toLocaleString()}
          </p>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            ฿{price.toLocaleString()} each
          </p>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => decreaseQuantity(item.itemType, item.id)}
              className="size-7 p-0 cursor-pointer"
            >
              <Minus className="size-3.5" />
            </Button>

            <span className="min-w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => increaseQuantity(item.itemType, item.id)}
              disabled={item.maxQuantity != null && item.quantity >= item.maxQuantity}
              className="size-7 p-0 cursor-pointer"
            >
              <Plus className="size-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item.itemType, item.id)}
              className="ml-1 size-7 p-0 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
