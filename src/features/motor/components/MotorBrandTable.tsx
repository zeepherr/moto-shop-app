"use client";

import React from "react";
import { Bike } from "lucide-react";
import { StatusBadge } from "@/components/management/StatusBadge";
import { RowActions } from "@/components/management/RowActions";
import type { MotorBrandDTO } from "../types";

interface MotorBrandTableProps {
  brands: MotorBrandDTO[];
  onEdit: (brand: MotorBrandDTO) => void;
  onToggleStatus: (brand: MotorBrandDTO) => void;
  onDelete: (brand: MotorBrandDTO) => void;
}

export const MotorBrandTable: React.FC<MotorBrandTableProps> = ({
  brands,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  if (brands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/60">
          <Bike className="size-6" />
        </div>
        <p className="font-semibold text-foreground text-sm">No motorcycle brands found</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Try clearing search filters or add a new brand to your catalog.
        </p>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-2 p-2 md:hidden">
      {brands.map((brand) => (
        <article key={brand.id} className="rounded-xl border border-border/70 bg-background p-3.5">
          <header className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/50 text-xs font-bold uppercase tracking-wider text-foreground">{brand.name.slice(0, 2)}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{brand.name}</p><p className="text-xs text-muted-foreground">Motorcycle manufacturer</p></div>
            <div className="-mr-1 -mt-1 [&>button]:size-11 [&>button]:rounded-xl"><RowActions isActive={brand.isActive} onEdit={() => onEdit(brand)} onStatusChange={() => onToggleStatus(brand)} onDelete={() => onDelete(brand)} label="brand" /></div>
          </header>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Bike className="size-3.5" />{brand._count?.motors ?? 0} {brand._count?.motors === 1 ? "model" : "models"}</span>
            <StatusBadge isActive={brand.isActive} />
          </div>
        </article>
      ))}
    </div>
    <div className="hidden overflow-x-auto md:block">
    <table className="w-full min-w-[650px] text-sm">
      <thead>
        <tr className="border-b border-border/60 bg-muted/30">
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Brand Name
          </th>
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Models Registered
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
        {brands.map((brand) => (
          <tr
            key={brand.id}
            className="group hover:bg-muted/30 transition-colors"
          >
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-9.5 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/50 font-bold text-xs text-foreground uppercase tracking-wider shadow-2xs group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors">
                  {brand.name.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {brand.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Motorcycle manufacturer
                  </p>
                </div>
              </div>
            </td>

            <td className="px-4 py-3.5">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/50 px-2.5 py-1 rounded-lg border border-border/50">
                <Bike className="size-3.5 text-muted-foreground/70" />
                <span>
                  {brand._count?.motors ?? 0}{" "}
                  {brand._count?.motors === 1 ? "model" : "models"}
                </span>
              </span>
            </td>

            <td className="px-4 py-3.5">
              <StatusBadge isActive={brand.isActive} />
            </td>

            <td className="px-4 py-3.5 text-right">
              <RowActions
                isActive={brand.isActive}
                onEdit={() => onEdit(brand)}
                onStatusChange={() => onToggleStatus(brand)}
                onDelete={() => onDelete(brand)}
                label="brand"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    </>
  );
};
