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

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  label: string;
  placeholder: string;
  initialValue?: string;
  submitLabel?: string;
  onSubmit: (name: string) => void;
  isPending?: boolean;
}

export const ItemDialog: React.FC<ItemDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  label,
  placeholder,
  initialValue = "",
  submitLabel = "Save",
  onSubmit,
  isPending = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ItemDialogForm
          title={title}
          description={description}
          label={label}
          placeholder={placeholder}
          initialValue={initialValue}
          submitLabel={submitLabel}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
          isPending={isPending}
        />
      )}
    </Dialog>
  );
};

const ItemDialogForm: React.FC<Omit<ItemDialogProps, "open">> = ({
  onOpenChange,
  title,
  description,
  label,
  placeholder,
  initialValue = "",
  submitLabel = "Save",
  onSubmit,
  isPending = false,
}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError(`${label} is required`);
      return;
    }
    setError(null);
    onSubmit(value.trim());
  };

  return (
    <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="item-input">{label}</Label>
            <Input
              id="item-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              disabled={isPending}
              autoFocus
              className="h-10 rounded-xl"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
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
              {isPending ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
    </DialogContent>
  );
};
