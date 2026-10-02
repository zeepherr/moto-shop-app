"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategoryAction, updateCategoryAction } from "../actions/category.actions";
import type { ProductCategoryDTO } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ProductCategoryDTO | null;
}

export const CategoryModal: React.FC<Props> = ({ open, onOpenChange, category }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (category) setName(category.name);
    else setName("");
    setError(null);
  }, [category, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = category
        ? await updateCategoryAction(category.id, { name })
        : await createCategoryAction({ name });

      if (!res.success) {
        setError(res.error || "Failed to save category");
        return;
      }

      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogDescription>
          {category ? "Update category name" : "Create a new product category for your catalog"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="category-name">Category Name</Label>
          <Input
            id="category-name"
            required
            placeholder="e.g. Engine Oil, Brake Pads"
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
            {isPending ? "Saving..." : category ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
