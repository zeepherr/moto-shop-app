"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { MotoServiceDTO } from "../types";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: MotoServiceDTO | null;
  onSubmit: (values: { name: string; description?: string; price: number }) => void;
  isPending?: boolean;
}

export const ServiceDialog: React.FC<ServiceDialogProps> = ({
  open,
  onOpenChange,
  service,
  onSubmit,
  isPending = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ServiceDialogForm
          key={service?.id ?? "new"}
          onOpenChange={onOpenChange}
          service={service}
          onSubmit={onSubmit}
          isPending={isPending}
        />
      )}
    </Dialog>
  );
};

const ServiceDialogForm: React.FC<Omit<ServiceDialogProps, "open">> = ({
  onOpenChange,
  service,
  onSubmit,
  isPending = false,
}) => {
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [price, setPrice] = useState(service?.price.toString() ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Service name is required");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("Please enter a valid price");
      return;
    }

    setError(null);
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
    });
  };

  return (
    <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:max-h-[90vh] sm:p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Repair Service" : "Add Repair Service"}</DialogTitle>
          <DialogDescription>
            {service
              ? "Update service name, pricing, and labor description"
              : "Register a new workshop repair or maintenance service"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="srv-name">Service Name</Label>
            <Input
              id="srv-name"
              required
              placeholder="e.g. Engine Oil Change, Tire Replacement"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              autoFocus
              className="h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="srv-price">Labor / Service Price (฿)</Label>
            <Input
              id="srv-price"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isPending}
              className="h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="srv-desc">
              Description <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <textarea
              id="srv-desc"
              rows={2}
              placeholder="Standard labor time, tools required, or scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              className="flex w-full rounded-xl border border-input bg-card p-2.5 text-sm text-foreground shadow-xs outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-full px-4 h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white px-5 h-9 cursor-pointer active:scale-95 transition-all"
            >
              {isPending ? "Saving..." : service ? "Save Changes" : "Add Service"}
            </Button>
          </div>
        </form>
    </DialogContent>
  );
};
