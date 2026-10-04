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
import type { MotorDTO, MotorBrandDTO } from "../types";

interface MotorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motor?: MotorDTO | null;
  brands: MotorBrandDTO[];
  onSubmit: (values: { model: string; motorBrandId: number; type: "AUTOMATIC" | "MANUAL" }) => void;
  isPending?: boolean;
}

export const MotorDialog: React.FC<MotorDialogProps> = ({
  open,
  onOpenChange,
  motor,
  brands,
  onSubmit,
  isPending = false,
}) => {
  const formKey = `${motor?.id ?? "new"}:${brands.map((brand) => brand.id).join(",")}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <MotorDialogForm
          key={formKey}
          onOpenChange={onOpenChange}
          motor={motor}
          brands={brands}
          onSubmit={onSubmit}
          isPending={isPending}
        />
      )}
    </Dialog>
  );
};

const MotorDialogForm: React.FC<Omit<MotorDialogProps, "open">> = ({
  onOpenChange,
  motor,
  brands,
  onSubmit,
  isPending = false,
}) => {
  const [model, setModel] = useState(motor?.model ?? "");
  const [motorBrandId, setMotorBrandId] = useState<number>(motor?.motorBrandId ?? brands[0]?.id ?? 0);
  const [type, setType] = useState<"AUTOMATIC" | "MANUAL">(motor?.type ?? "AUTOMATIC");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) {
      setError("Model name is required");
      return;
    }
    if (!motorBrandId) {
      setError("Please select a brand");
      return;
    }

    setError(null);
    onSubmit({
      model: model.trim(),
      motorBrandId: Number(motorBrandId),
      type,
    });
  };

  return (
    <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{motor ? "Edit Motorcycle Model" : "Add Motorcycle Model"}</DialogTitle>
          <DialogDescription>
            {motor
              ? "Update model specifications and manufacturer details"
              : "Register a new motorcycle model in your shop catalog"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="dlg-motor-brand">Manufacturer / Brand</Label>
            <select
              id="dlg-motor-brand"
              className="flex h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              value={motorBrandId}
              onChange={(e) => setMotorBrandId(Number(e.target.value))}
              disabled={isPending}
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dlg-motor-model">Model Name</Label>
            <Input
              id="dlg-motor-model"
              required
              placeholder="e.g. Wave 110i, Click 160, NMAX"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isPending}
              autoFocus
              className="h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dlg-motor-type">Transmission Type</Label>
            <select
              id="dlg-motor-type"
              className="flex h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              value={type}
              onChange={(e) => setType(e.target.value as "AUTOMATIC" | "MANUAL")}
              disabled={isPending}
            >
              <option value="AUTOMATIC">AUTOMATIC</option>
              <option value="MANUAL">MANUAL</option>
            </select>
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
              {isPending ? "Saving..." : motor ? "Save Changes" : "Add Model"}
            </Button>
          </div>
        </form>
    </DialogContent>
  );
};
