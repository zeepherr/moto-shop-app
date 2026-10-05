"use client";

import React, { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";
import { DockedTableCard } from "@/components/management/DockedTableCard";
import { ItemDialog } from "@/components/management/ItemDialog";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { MotorBrandStats } from "./MotorBrandStats";
import { MotorBrandTable } from "./MotorBrandTable";
import {
  createBrandAction,
  updateBrandAction,
  deleteBrandAction,
} from "../actions/motor.actions";
import type { MotorBrandDTO } from "../types";

export const MotorBrandList: React.FC<{ initialBrands: MotorBrandDTO[] }> = ({
  initialBrands,
}) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<MotorBrandDTO | null>(null);
  const [statusBrand, setStatusBrand] = useState<MotorBrandDTO | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<MotorBrandDTO | null>(null);

  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return initialBrands.filter((b) => {
      const matchesSearch = !term || b.name.toLowerCase().includes(term);
      const matchesStatus =
        status === "all" ||
        (status === "active" && b.isActive) ||
        (status === "inactive" && !b.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [initialBrands, search, status]);

  const counts = useMemo(
    () => ({
      all: initialBrands.length,
      active: initialBrands.filter((b) => b.isActive).length,
      inactive: initialBrands.filter((b) => !b.isActive).length,
    }),
    [initialBrands]
  );

  const handleCreate = (name: string) => {
    startTransition(async () => {
      const res = await createBrandAction({ name });
      if (res.success) {
        toast.success("Motor brand created successfully");
        setCreateOpen(false);
      } else {
        toast.error(res.error || "Failed to create brand");
      }
    });
  };

  const handleUpdate = (name: string) => {
    if (!editingBrand) return;
    startTransition(async () => {
      const res = await updateBrandAction(editingBrand.id, { name });
      if (res.success) {
        toast.success("Motor brand updated successfully");
        setEditingBrand(null);
      } else {
        toast.error(res.error || "Failed to update brand");
      }
    });
  };

  const handleConfirmStatus = () => {
    if (!statusBrand) return;
    startTransition(async () => {
      const res = await updateBrandAction(statusBrand.id, {
        isActive: !statusBrand.isActive,
      });
      if (res.success) {
        toast.success(
          `Brand ${statusBrand.isActive ? "deactivated" : "activated"}`
        );
        setStatusBrand(null);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingBrand) return;
    startTransition(async () => {
      const res = await deleteBrandAction(deletingBrand.id);
      if (res.success) {
        toast.success("Motor brand deleted successfully");
        setDeletingBrand(null);
      } else {
        toast.error(res.error || "Failed to delete brand");
      }
    });
  };

  return (
    <ManagementLayout className="!space-y-4 sm:!space-y-6">
      <PageHeader
        compactOnMobile
        title="Motorcycle Brands"
        description="Manage motorcycle manufacturers and vehicle makes"
        count={initialBrands.length}
        actionLabel="Add Brand"
        onAction={() => setCreateOpen(true)}
      />

      <MotorBrandStats brands={initialBrands} />

      <DockedTableCard
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search brands by name..."
        status={status}
        onStatusChange={setStatus}
        statusCounts={counts}
        hasActiveFilters={search.trim() !== "" || status !== "all"}
        onClearFilters={() => {
          setSearch("");
          setStatus("all");
        }}
        totalFiltered={filtered.length}
        totalAll={initialBrands.length}
        entityName="brands"
      >
        <MotorBrandTable
          brands={filtered}
          onEdit={setEditingBrand}
          onToggleStatus={setStatusBrand}
          onDelete={setDeletingBrand}
        />
      </DockedTableCard>

      <ItemDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add Motorcycle Brand"
        description="Add a new motorcycle brand to your shop catalog."
        label="Brand Name"
        placeholder="e.g. Honda, Yamaha, Kawasaki, Ducati"
        submitLabel="Add Brand"
        onSubmit={handleCreate}
        isPending={isPending}
      />

      <ItemDialog
        open={Boolean(editingBrand)}
        onOpenChange={(open) => !open && setEditingBrand(null)}
        title="Edit Motorcycle Brand"
        description="Update brand name and details."
        label="Brand Name"
        placeholder="e.g. Honda"
        initialValue={editingBrand?.name || ""}
        submitLabel="Save Changes"
        onSubmit={handleUpdate}
        isPending={isPending}
      />

      <ConfirmActionDialog
        open={Boolean(statusBrand)}
        onOpenChange={(open) => !open && setStatusBrand(null)}
        title={statusBrand?.isActive ? "Deactivate this brand?" : "Activate this brand?"}
        description={
          statusBrand?.isActive
            ? `Models under "${statusBrand.name}" will remain, but the brand will be marked inactive.`
            : `"${statusBrand?.name}" will become active and available for model registration.`
        }
        confirmLabel={statusBrand?.isActive ? "Deactivate" : "Activate"}
        cancelLabel="Cancel"
        variant={statusBrand?.isActive ? "destructive" : "default"}
        isPending={isPending}
        onConfirm={handleConfirmStatus}
      />

      <ConfirmActionDialog
        open={Boolean(deletingBrand)}
        onOpenChange={(open) => !open && setDeletingBrand(null)}
        title="Delete this brand?"
        description={
          deletingBrand
            ? `Are you sure you want to permanently delete "${deletingBrand.name}"? This action cannot be undone.`
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
