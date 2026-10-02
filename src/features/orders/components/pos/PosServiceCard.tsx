"use client";

import React from "react";
import { Plus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePosStore } from "../../stores/usePosStore";
import { serviceToCartItem } from "../../utils/cart.util";

interface PosServiceCardProps {
  service: {
    id: number;
    name: string;
    description?: string | null;
    price: number | string | { toString: () => string };
  };
}

export const PosServiceCard: React.FC<PosServiceCardProps> = ({ service }) => {
  const addItem = usePosStore((store) => store.addItem);
  const price = Number(service.price) || 0;

  const handleAddService = () => {
    const cartItem = serviceToCartItem(service);
    addItem(cartItem);
  };

  return (
    <article
      onClick={handleAddService}
      className="flex min-h-36 flex-col rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/40 cursor-pointer"
    >
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Wrench className="size-4" />
      </div>

      <div className="mt-3 min-w-0">
        <h3 className="truncate text-sm font-medium text-foreground">{service.name}</h3>

        {service.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {service.description}
          </p>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
        <p className="text-base font-semibold text-foreground">
          ฿{price.toLocaleString()}
        </p>

        <Button
          type="button"
          size="sm"
          className="size-8 p-0 shrink-0 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleAddService();
          }}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </article>
  );
};
