"use client";

import { Bike } from "lucide-react";
import type { SelectedMotor } from "../../types";

interface PosVehicleSelectorProps {
  vehicles: SelectedMotor[];
  selectedMotorId: number | null;
  onVehicleChange: (motorId: number | null) => void;
}

export function PosVehicleSelector({ vehicles, selectedMotorId, onVehicleChange }: PosVehicleSelectorProps) {
  if (vehicles.length === 0) {
    return <p className="mt-2 text-xs text-muted-foreground">No registered motorcycles for this customer.</p>;
  }

  return (
    <label className="mt-3 block space-y-1.5">
      <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"><Bike className="size-4" />Vehicle for this order</span>
      <select
        value={selectedMotorId ?? ""}
        onChange={(event) => onVehicleChange(event.target.value ? Number(event.target.value) : null)}
        className="h-12 w-full rounded-xl border border-input bg-background px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">No vehicle selected</option>
        {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.label}</option>)}
      </select>
    </label>
  );
}
