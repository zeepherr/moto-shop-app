"use client";

import React, { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { Bike } from "lucide-react";
import { PageHeader } from "@/components/management/PageHeader";
import { FilterToolbar } from "@/components/management/FilterToolbar";
import { StatusBadge } from "@/components/management/StatusBadge";
import { RowActions } from "@/components/management/RowActions";
import { MotorDialog } from "./MotorDialog";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
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

  const handleCreate = (values: { model: string; motorBrandId: number; type: "AUTOMATIC" | "MANUAL" }) => {
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

  const handleUpdate = (values: { model: string; motorBrandId: number; type: "AUTOMATIC" | "MANUAL" }) => {
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
        toast.success(`Model ${statusMotor.isActive ? "deactivated" : "activated"}`);
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
    <div className="space-y-4">
      <PageHeader
        title="Motorcycle Models"
        description="Catalog vehicle models, engine platforms, and transmission types"
        actionLabel="Add Model"
        onAction={() => setCreateOpen(true)}
      />

      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search model name or brand..."
        status={status}
        onStatusChange={setStatus}
        statusCounts={counts}
        hasActiveFilters={search.trim() !== "" || selectedBrand !== "all" || status !== "all"}
        onClearFilters={() => {
          setSearch("");
          setSelectedBrand("all");
          setStatus("all");
        }}
      >
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="h-10 rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus:ring-2 focus:ring-primary sm:w-44 cursor-pointer"
        >
          <option value="all">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={String(b.id)}>
              {b.name}
            </option>
          ))}
        </select>
      </FilterToolbar>

      {/* Unified Table */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5 py-6">
                      <Bike className="size-8 text-muted-foreground/50" />
                      <p className="font-medium text-foreground text-sm">No motorcycle models found</p>
                      <p className="text-xs text-muted-foreground">Try clearing filters or add a new model.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/40 font-semibold text-xs text-foreground uppercase">
                          {m.model.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{m.model}</p>
                          <p className="text-xs text-muted-foreground">Motorcycle vehicle model</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-md border border-border/50">
                        {m.motorBrand?.name || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
                        {m.type}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge isActive={m.isActive} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <RowActions
                        isActive={m.isActive}
                        onEdit={() => setEditingMotor(m)}
                        onStatusChange={() => setStatusMotor(m)}
                        onDelete={() => setDeletingMotor(m)}
                        label="model"
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
            ? `"${statusMotor.model}" will no longer be available for new customer vehicle assignment.`
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
    </div>
  );
};
