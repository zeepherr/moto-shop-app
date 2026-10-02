"use client";

import React from "react";
import { Bike } from "lucide-react";
import { StatusBadge } from "@/components/management/StatusBadge";
import { RowActions } from "@/components/management/RowActions";
import type { MotorDTO } from "../types";

interface MotorTableProps {
  motors: MotorDTO[];
  onEdit: (motor: MotorDTO) => void;
  onToggleStatus: (motor: MotorDTO) => void;
  onDelete: (motor: MotorDTO) => void;
}

export const MotorTable: React.FC<MotorTableProps> = ({
  motors,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  if (motors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/60">
          <Bike className="size-6" />
        </div>
        <p className="font-semibold text-foreground text-sm">No motorcycle models found</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Try clearing search filters or add a new model to your catalog.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full min-w-[700px] text-sm">
      <thead>
        <tr className="border-b border-border/60 bg-muted/30">
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Model Name
          </th>
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Manufacturer
          </th>
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Transmission
          </th>
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Status
          </th>
          <th className="w-16 px-4 py-3 text-right font-medium text-muted-foreground">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-border/40">
        {motors.map((m) => (
          <tr key={m.id} className="group hover:bg-muted/30 transition-colors">
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-9.5 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/50 font-bold text-xs text-foreground uppercase tracking-wider shadow-2xs group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors">
                  {m.model.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {m.model}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Motorcycle vehicle model
                  </p>
                </div>
              </div>
            </td>

            <td className="px-4 py-3.5">
              <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-medium bg-muted/50 px-2.5 py-1 rounded-lg border border-border/50">
                {m.motorBrand?.name || "—"}
              </span>
            </td>

            <td className="px-4 py-3.5">
              <span className="inline-flex items-center rounded-md bg-secondary/70 px-2 py-0.5 text-xs font-medium text-secondary-foreground border border-border/40">
                {m.type === "AUTOMATIC" ? "Automatic (CVT)" : "Manual (Clutch)"}
              </span>
            </td>

            <td className="px-4 py-3.5">
              <StatusBadge isActive={m.isActive} />
            </td>

            <td className="px-4 py-3.5 text-right">
              <RowActions
                isActive={m.isActive}
                onEdit={() => onEdit(m)}
                onStatusChange={() => onToggleStatus(m)}
                onDelete={() => onDelete(m)}
                label="model"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
