"use client";

import React, { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { Bike, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/management/PageHeader";
import { FilterToolbar } from "@/components/management/FilterToolbar";
import { StatusBadge } from "@/components/management/StatusBadge";
import { RowActions } from "@/components/management/RowActions";
import { ItemDialog } from "@/components/management/ItemDialog";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
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
        toast.success(`Brand ${statusBrand.isActive ? "deactivated" : "activated"}`);
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
    <div className="space-y-4">
      <PageHeader
        title="Motorcycle Brands"
        description="Manage motorcycle manufacturers and vehicle makes"
        actionLabel="Add Brand"
        onAction={() => setCreateOpen(true)}
      />

      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search brands..."
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5 py-6">
                      <Bike className="size-8 text-muted-foreground/50" />
                      <p className="font-medium text-foreground text-sm">No motorcycle brands found</p>
                      <p className="text-xs text-muted-foreground">Try clearing filters or add a new brand.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/40 font-semibold text-xs text-foreground uppercase">
                          {b.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{b.name}</p>
                          <p className="text-xs text-muted-foreground">Motorcycle manufacturer</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium bg-muted/40 px-2 py-0.5 rounded-md border border-border/40">
                        <Bike className="size-3" />
                        {b._count?.motors ?? 0} {b._count?.motors === 1 ? "model" : "models"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge isActive={b.isActive} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <RowActions
                        isActive={b.isActive}
                        onEdit={() => setEditingBrand(b)}
                        onStatusChange={() => setStatusBrand(b)}
                        onDelete={() => setDeletingBrand(b)}
                        label="brand"
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
    </div>
  );
};
