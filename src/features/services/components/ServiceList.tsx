"use client";

import React, { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { Wrench } from "lucide-react";
import { PageHeader } from "@/components/management/PageHeader";
import { FilterToolbar } from "@/components/management/FilterToolbar";
import { StatusBadge } from "@/components/management/StatusBadge";
import { RowActions } from "@/components/management/RowActions";
import { ServiceDialog } from "./ServiceDialog";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
} from "../actions/motoService.actions";
import type { MotoServiceDTO } from "../types";

export const ServiceList: React.FC<{ initialServices: MotoServiceDTO[] }> = ({
  initialServices,
}) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingService, setEditingService] = useState<MotoServiceDTO | null>(null);
  const [statusService, setStatusService] = useState<MotoServiceDTO | null>(null);
  const [deletingService, setDeletingService] = useState<MotoServiceDTO | null>(null);

  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return initialServices.filter((s) => {
      const matchesSearch =
        !term ||
        s.name.toLowerCase().includes(term) ||
        (s.description && s.description.toLowerCase().includes(term));
      const matchesStatus =
        status === "all" ||
        (status === "active" && s.isActive) ||
        (status === "inactive" && !s.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [initialServices, search, status]);

  const counts = useMemo(
    () => ({
      all: initialServices.length,
      active: initialServices.filter((s) => s.isActive).length,
      inactive: initialServices.filter((s) => !s.isActive).length,
    }),
    [initialServices]
  );

  const handleCreate = (values: { name: string; description?: string; price: number }) => {
    startTransition(async () => {
      const res = await createServiceAction(values);
      if (res.success) {
        toast.success("Service created successfully");
        setCreateOpen(false);
      } else {
        toast.error(res.error || "Failed to create service");
      }
    });
  };

  const handleUpdate = (values: { name: string; description?: string; price: number }) => {
    if (!editingService) return;
    startTransition(async () => {
      const res = await updateServiceAction(editingService.id, values);
      if (res.success) {
        toast.success("Service updated successfully");
        setEditingService(null);
      } else {
        toast.error(res.error || "Failed to update service");
      }
    });
  };

  const handleConfirmStatus = () => {
    if (!statusService) return;
    startTransition(async () => {
      const res = await updateServiceAction(statusService.id, {
        isActive: !statusService.isActive,
      });
      if (res.success) {
        toast.success(`Service ${statusService.isActive ? "deactivated" : "activated"}`);
        setStatusService(null);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingService) return;
    startTransition(async () => {
      const res = await deleteServiceAction(deletingService.id);
      if (res.success) {
        toast.success("Service deleted successfully");
        setDeletingService(null);
      } else {
        toast.error(res.error || "Failed to delete service");
      }
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Workshop Services"
        description="Manage repair labor, maintenance packages, and diagnostic rates"
        actionLabel="Add Service"
        onAction={() => setCreateOpen(true)}
      />

      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search services or scope..."
        status={status}
        onStatusChange={setStatus}
        statusCounts={counts}
        hasActiveFilters={search.trim() !== "" || status !== "all"}
        onClearFilters={() => {
          setSearch("");
          setStatus("all");
        }}
      />

      {/* Unified Table */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Service Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Scope & Description
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Price (THB)
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5 py-6">
                      <Wrench className="size-8 text-muted-foreground/50" />
                      <p className="font-medium text-foreground text-sm">No services found</p>
                      <p className="text-xs text-muted-foreground">Try clearing filters or add a new repair service.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((serv) => (
                  <tr key={serv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/40 font-semibold text-xs text-foreground uppercase">
                          <Wrench className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{serv.name}</p>
                          <p className="text-xs text-muted-foreground">Repair & maintenance</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-xs text-muted-foreground max-w-xs truncate">
                        {serv.description || "—"}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold text-foreground">
                        ฿{Number(serv.price).toLocaleString()}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge isActive={serv.isActive} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <RowActions
                        isActive={serv.isActive}
                        onEdit={() => setEditingService(serv)}
                        onStatusChange={() => setStatusService(serv)}
                        onDelete={() => setDeletingService(serv)}
                        label="service"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogs */}
      <ServiceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        isPending={isPending}
      />

      <ServiceDialog
        open={Boolean(editingService)}
        onOpenChange={(open) => !open && setEditingService(null)}
        service={editingService}
        onSubmit={handleUpdate}
        isPending={isPending}
      />

      <ConfirmActionDialog
        open={Boolean(statusService)}
        onOpenChange={(open) => !open && setStatusService(null)}
        title={statusService?.isActive ? "Deactivate this service?" : "Activate this service?"}
        description={
          statusService?.isActive
            ? `"${statusService.name}" will no longer appear as an available service in POS.`
            : `"${statusService?.name}" will become active and available in POS.`
        }
        confirmLabel={statusService?.isActive ? "Deactivate" : "Activate"}
        cancelLabel="Cancel"
        variant={statusService?.isActive ? "destructive" : "default"}
        isPending={isPending}
        onConfirm={handleConfirmStatus}
      />

      <ConfirmActionDialog
        open={Boolean(deletingService)}
        onOpenChange={(open) => !open && setDeletingService(null)}
        title="Delete this service?"
        description={
          deletingService
            ? `Are you sure you want to permanently delete "${deletingService.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
