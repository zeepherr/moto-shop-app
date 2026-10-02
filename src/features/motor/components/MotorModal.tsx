"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMotorAction, updateMotorAction } from "../actions/motor.actions";
import type { MotorDTO, MotorBrandDTO } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motor?: MotorDTO | null;
  brands: MotorBrandDTO[];
}

export const MotorModal: React.FC<Props> = ({ open, onOpenChange, motor, brands }) => {
  const [model, setModel] = useState("");
  const [motorBrandId, setMotorBrandId] = useState<number | "">("");
  const [type, setType] = useState<"AUTOMATIC" | "MANUAL">("AUTOMATIC");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (motor) {
      setModel(motor.model);
      setMotorBrandId(motor.motorBrandId);
      setType(motor.type as "AUTOMATIC" | "MANUAL");
    } else {
      setModel("");
      setMotorBrandId(brands[0]?.id || "");
      setType("AUTOMATIC");
    }
    setError(null);
  }, [motor, brands, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!motorBrandId) {
      setError("Please select a brand");
      return;
    }

    startTransition(async () => {
      const payload = { model, motorBrandId: Number(motorBrandId), type };
      const res = motor
        ? await updateMotorAction(motor.id, payload)
        : await createMotorAction(payload);

      if (!res.success) {
        setError(res.error || "Failed to save motorcycle model");
        return;
      }

      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>{motor ? "Edit Motorcycle Model" : "Add Motorcycle Model"}</DialogTitle>
        <DialogDescription>
          {motor ? "Update motorcycle model catalog details" : "Register a new motorcycle model"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="motor-brand">Brand</Label>
          <select
            id="motor-brand"
            className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <Label htmlFor="motor-model">Model Name</Label>
          <Input
            id="motor-model"
            required
            placeholder="e.g. Wave 110i, Click 160, NMAX"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="motor-type">Transmission Type</Label>
          <select
            id="motor-type"
            className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={type}
            onChange={(e) => setType(e.target.value as "AUTOMATIC" | "MANUAL")}
            disabled={isPending}
          >
            <option value="AUTOMATIC">AUTOMATIC</option>
            <option value="MANUAL">MANUAL</option>
          </select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : motor ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
