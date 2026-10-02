"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrandAction, updateBrandAction } from "../actions/motor.actions";
import type { MotorBrandDTO } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: MotorBrandDTO | null;
}

export const MotorBrandModal: React.FC<Props> = ({ open, onOpenChange, brand }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (brand) setName(brand.name);
    else setName("");
    setError(null);
  }, [brand, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = brand
        ? await updateBrandAction(brand.id, { name })
        : await createBrandAction({ name });

      if (!res.success) {
        setError(res.error || "Failed to save brand");
        return;
      }

      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>{brand ? "Edit Motor Brand" : "Add Motor Brand"}</DialogTitle>
        <DialogDescription>
          {brand ? "Update motorcycle brand name" : "Register a new motorcycle manufacturer"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="brand-name">Brand Name</Label>
          <Input
            id="brand-name"
            required
            placeholder="e.g. Honda, Yamaha, Kawasaki"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : brand ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
