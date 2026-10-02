"use client";

import React, { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";
import { DockedTableCard } from "@/components/management/DockedTableCard";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { MotorStats } from "./MotorStats";
import { MotorTable } from "./MotorTable";
import { MotorDialog } from "./MotorDialog";
import {
  createMotorAction,
  updateMotorAction,
  deleteMotorAction,
} from "../actions/motor.actions";
import type { MotorDTO, MotorBrandDTO } from "../types";

export const MotorList: React.FC<{
  initialMotors: MotorDTO[];
  brands: MotorBrandDTO[];
}> = ({ initialMotors, brands }) => {
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [status, setStatus] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingMotor, setEditingMotor] = useState<MotorDTO | null>(null);
  const [statusMotor, setStatusMotor] = useState<MotorDTO | null>(null);
  const [deletingMotor, setDeletingMotor] = useState<MotorDTO | null>(null);

  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return initialMotors.filter((m) => {
      const matchesSearch =
        !term ||
        m.model.toLowerCase().includes(term) ||
        (m.motorBrand?.name && m.motorBrand.name.toLowerCase().includes(term));
      const matchesBrand =
        selectedBrand === "all" || String(m.motorBrandId) === selectedBrand;
      const matchesStatus =
        status === "all" ||
        (status === "active" && m.isActive) ||
        (status === "inactive" && !m.isActive);
      return matchesSearch && matchesBrand && matchesStatus;
    });
  }, [initialMotors, search, selectedBrand, status]);

  const counts = useMemo(
    () => ({
      all: initialMotors.length,
      active: initialMotors.filter((m) => m.isActive).length,
      inactive: initialMotors.filter((m) => !m.isActive).length,
    }),
    [initialMotors]
  );

  const handleCreate = (values: {
    model: string;
    motorBrandId: number;
    type: "AUTOMATIC" | "MANUAL";
  }) => {
    startTransition(async () => {
      const res = await createMotorAction(values);
      if (res.success) {
        toast.success("Motorcycle model added successfully");
        setCreateOpen(false);
      } else {
        toast.error(res.error || "Failed to create motorcycle model");
      }
    });
  };

  const handleUpdate = (values: {
    model: string;
    motorBrandId: number;
    type: "AUTOMATIC" | "MANUAL";
  }) => {
    if (!editingMotor) return;
    startTransition(async () => {
      const res = await updateMotorAction(editingMotor.id, values);
      if (res.success) {
        toast.success("Motorcycle model updated successfully");
        setEditingMotor(null);
      } else {
        toast.error(res.error || "Failed to update model");
      }
    });
  };

  const handleConfirmStatus = () => {
    if (!statusMotor) return;
    startTransition(async () => {
      const res = await updateMotorAction(statusMotor.id, {
        isActive: !statusMotor.isActive,
      });
      if (res.success) {
        toast.success(
          `Model ${statusMotor.isActive ? "deactivated" : "activated"}`
        );
        setStatusMotor(null);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingMotor) return;
    startTransition(async () => {
      const res = await deleteMotorAction(deletingMotor.id);
      if (res.success) {
        toast.success("Motorcycle model deleted successfully");
        setDeletingMotor(null);
      } else {
        toast.error(res.error || "Failed to delete model");
      }
    });
  };

  return (
    <ManagementLayout>
      <PageHeader
        title="Motorcycle Models"
        description="Catalog vehicle models, engine platforms, and transmission types"
        count={initialMotors.length}
        actionLabel="Add Model"
        onAction={() => setCreateOpen(true)}
      />

      <MotorStats motors={initialMotors} brands={brands} />

      <DockedTableCard
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search model name or brand..."
        status={status}
        onStatusChange={setStatus}
        statusCounts={counts}
        filterSlot={
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="h-9.5 rounded-xl border border-input/80 bg-background/50 px-3 text-xs sm:text-sm text-foreground shadow-2xs outline-none focus:ring-1 focus:ring-primary sm:w-44 cursor-pointer"
          >
            <option value="all">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={String(b.id)}>
                {b.name}
              </option>
            ))}
          </select>
        }
        hasActiveFilters={
          search.trim() !== "" ||
          selectedBrand !== "all" ||
          status !== "all"
        }
        onClearFilters={() => {
          setSearch("");
          setSelectedBrand("all");
          setStatus("all");
        }}
        totalFiltered={filtered.length}
        totalAll={initialMotors.length}
        entityName="models"
      >
        <MotorTable
          motors={filtered}
          onEdit={setEditingMotor}
          onToggleStatus={setStatusMotor}
          onDelete={setDeletingMotor}
        />
      </DockedTableCard>

      <MotorDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        brands={brands}
        onSubmit={handleCreate}
        isPending={isPending}
      />

      <MotorDialog
        open={Boolean(editingMotor)}
        onOpenChange={(open) => !open && setEditingMotor(null)}
        motor={editingMotor}
        brands={brands}
        onSubmit={handleUpdate}
        isPending={isPending}
      />

      <ConfirmActionDialog
        open={Boolean(statusMotor)}
        onOpenChange={(open) => !open && setStatusMotor(null)}
        title={statusMotor?.isActive ? "Deactivate this model?" : "Activate this model?"}
        description={
          statusMotor?.isActive
            ? `"${statusMotor.model}" will no longer be available for customer vehicle assignment.`
            : `"${statusMotor?.model}" will become active and available for customer registration.`
        }
        confirmLabel={statusMotor?.isActive ? "Deactivate" : "Activate"}
        cancelLabel="Cancel"
        variant={statusMotor?.isActive ? "destructive" : "default"}
        isPending={isPending}
        onConfirm={handleConfirmStatus}
      />

      <ConfirmActionDialog
        open={Boolean(deletingMotor)}
        onOpenChange={(open) => !open && setDeletingMotor(null)}
        title="Delete this model?"
        description={
          deletingMotor
            ? `Are you sure you want to permanently delete "${deletingMotor.model}"? This action cannot be undone.`
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
