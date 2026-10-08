"use client";

import { Bike } from "lucide-react";
import type { SelectedMotor } from "../../types";
import { Select } from "@/components/ui/select";

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
      <Select
        value={selectedMotorId === null ? "" : String(selectedMotorId)}
        onValueChange={(value) => onVehicleChange(value ? Number(value) : null)}
        className="h-12 w-full rounded-xl border border-input bg-background px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        options={[
          { value: "", label: "No vehicle selected" },
          ...vehicles.map((vehicle) => ({ value: String(vehicle.id), label: vehicle.licensePlate ? `${vehicle.label} · ${vehicle.licensePlate}` : vehicle.label })),
        ]}
      />
    </label>
  );
}
