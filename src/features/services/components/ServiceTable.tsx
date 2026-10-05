"use client";

import React from "react";
import { Wrench } from "lucide-react";
import { StatusBadge } from "@/components/management/StatusBadge";
import { RowActions } from "@/components/management/RowActions";
import type { MotoServiceDTO } from "../types";

interface ServiceTableProps {
  services: MotoServiceDTO[];
  onEdit: (service: MotoServiceDTO) => void;
  onToggleStatus: (service: MotoServiceDTO) => void;
  onDelete: (service: MotoServiceDTO) => void;
}

export const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/60">
          <Wrench className="size-6" />
        </div>
        <p className="font-semibold text-foreground text-sm">No services found</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Try clearing search filters or add a new repair package.
        </p>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-2 p-2 md:hidden">
      {services.map((service) => (
        <article key={service.id} className="rounded-xl border border-border/70 bg-background p-3.5">
          <header className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/50"><Wrench className="size-4 text-primary" /></div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{service.name}</p><p className="text-xs text-muted-foreground">Repair & maintenance</p></div>
            <div className="-mr-1 -mt-1 [&>button]:size-11 [&>button]:rounded-xl"><RowActions isActive={service.isActive} onEdit={() => onEdit(service)} onStatusChange={() => onToggleStatus(service)} onDelete={() => onDelete(service)} label="service" /></div>
          </header>
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">{service.description || "Standard technician labor service"}</p>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
            <div><p className="text-xs text-muted-foreground">Standard rate</p><p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">฿{Number(service.price).toLocaleString()}</p></div>
            <StatusBadge isActive={service.isActive} />
          </div>
        </article>
      ))}
    </div>
    <div className="hidden overflow-x-auto md:block">
    <table className="w-full min-w-[700px] text-sm">
      <thead>
        <tr className="border-b border-border/60 bg-muted/30">
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Service Name
          </th>
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Scope & Details
          </th>
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Standard Rate
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
        {services.map((serv) => (
          <tr key={serv.id} className="group hover:bg-muted/30 transition-colors">
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-9.5 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/50 font-bold text-xs text-foreground shadow-2xs group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors">
                  <Wrench className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {serv.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Repair & maintenance service
                  </p>
                </div>
              </div>
            </td>

            <td className="px-4 py-3.5">
              <p className="text-xs text-muted-foreground max-w-sm line-clamp-1">
                {serv.description || "Standard technician labor service"}
              </p>
            </td>

            <td className="px-4 py-3.5">
              <span className="font-semibold text-foreground tabular-nums">
                ฿{Number(serv.price).toLocaleString()}
              </span>
            </td>

            <td className="px-4 py-3.5">
              <StatusBadge isActive={serv.isActive} />
            </td>

            <td className="px-4 py-3.5 text-right">
              <RowActions
                isActive={serv.isActive}
                onEdit={() => onEdit(serv)}
                onStatusChange={() => onToggleStatus(serv)}
                onDelete={() => onDelete(serv)}
                label="service"
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
