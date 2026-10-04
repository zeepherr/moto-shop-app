"use client";

import React from "react";
import { Plus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePosStore } from "../../stores/usePosStore";
import { serviceToCartItem } from "../../utils/cart.util";

export interface PosService {
  id: number;
  name: string;
  description?: string | null;
  price: number | string | { toString: () => string };
}

interface PosServiceCardProps {
  service: PosService;
}

export const PosServiceCard: React.FC<PosServiceCardProps> = ({ service }) => {
  const addItem = usePosStore((store) => store.addItem);
  const price = Number(service.price) || 0;

  const handleAddService = () => {
    const cartItem = serviceToCartItem(service);
    addItem(cartItem);
  };

  return (
    <article className="flex min-h-40 min-w-0 flex-col rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/40 sm:rounded-2xl sm:p-3.5">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Wrench className="size-4" />
      </div>

      <div className="mt-3 min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">{service.name}</h3>

        {service.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
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
          className="size-11 shrink-0 cursor-pointer rounded-xl"
          onClick={handleAddService}
          aria-label={`Add ${service.name} to cart`}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </article>
  );
};
