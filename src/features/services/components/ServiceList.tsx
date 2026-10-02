"use client";

import React, { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";
import { DockedTableCard } from "@/components/management/DockedTableCard";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { ServiceStats } from "./ServiceStats";
import { ServiceTable } from "./ServiceTable";
import { ServiceDialog } from "./ServiceDialog";
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

  const handleCreate = (values: {
    name: string;
    description?: string;
    price: number;
  }) => {
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

  const handleUpdate = (values: {
    name: string;
    description?: string;
    price: number;
  }) => {
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
        toast.success(
          `Service ${statusService.isActive ? "deactivated" : "activated"}`
        );
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
    <ManagementLayout>
      <PageHeader
        title="Workshop Services"
        description="Manage repair labor, maintenance packages, and diagnostic rates"
        count={initialServices.length}
        actionLabel="Add Service"
        onAction={() => setCreateOpen(true)}
      />

      <ServiceStats services={initialServices} />

      <DockedTableCard
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
        totalFiltered={filtered.length}
        totalAll={initialServices.length}
        entityName="services"
      >
        <ServiceTable
          services={filtered}
          onEdit={setEditingService}
          onToggleStatus={setStatusService}
          onDelete={setDeletingService}
        />
      </DockedTableCard>

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
            ? `"${statusService.name}" will no longer appear as an available item in the POS service catalog.`
            : `"${statusService?.name}" will become active and available for technician orders.`
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
    </ManagementLayout>
  );
};
