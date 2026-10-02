"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createServiceAction, updateServiceAction } from "../actions/motoService.actions";
import type { MotoServiceDTO } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: MotoServiceDTO | null;
}

export const ServiceModal: React.FC<Props> = ({ open, onOpenChange, service }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description || "");
      setPrice(service.price.toString());
    } else {
      setName("");
      setDescription("");
      setPrice("");
    }
    setError(null);
  }, [service, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const payload = {
        name,
        description: description || undefined,
        price: Number(price),
      };

      const res = service
        ? await updateServiceAction(service.id, payload)
        : await createServiceAction(payload);

      if (!res.success) {
        setError(res.error || "Failed to save service");
        return;
      }

      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>{service ? "Edit Service" : "Add Service"}</DialogTitle>
        <DialogDescription>
          {service ? "Update repair service details" : "Add a new repair or maintenance service"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="service-name">Service Name</Label>
          <Input
            id="service-name"
            required
            placeholder="e.g. Engine Oil Change, Brake Service"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-desc">Description (Optional)</Label>
          <Input
            id="service-desc"
            placeholder="e.g. Standard labor and inspection"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service-price">Price (THB)</Label>
          <Input
            id="service-price"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isPending}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : service ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
