"use client";

import React, { useState } from "react";
import { CircleCheck, CircleOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RowActionsProps {
  onEdit: () => void;
  onStatusChange: () => void;
  onDelete: () => void;
  isActive: boolean;
  label?: string;
}

export const RowActions: React.FC<RowActionsProps> = ({
  onEdit,
  onStatusChange,
  onDelete,
  isActive,
  label = "item",
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="size-8 p-0 cursor-pointer opacity-60 transition-opacity hover:opacity-100"
        aria-label={`Actions for ${label}`}
      >
        <MoreHorizontal className="size-4" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-1 w-44 rounded-xl border border-border bg-popover p-1 shadow-lg text-popover-foreground text-xs animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-muted cursor-pointer transition-colors text-foreground"
            >
              <Pencil className="size-3.5" />
              Edit {label}
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onStatusChange();
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-muted cursor-pointer transition-colors ${
                isActive ? "text-destructive" : "text-emerald-500"
              }`}
            >
              {isActive ? (
                <>
                  <CircleOff className="size-3.5" />
                  Deactivate
                </>
              ) : (
                <>
                  <CircleCheck className="size-3.5" />
                  Activate
                </>
              )}
            </button>

            <div className="my-1 border-t border-border/50" />

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-destructive/10 text-destructive cursor-pointer transition-colors"
            >
              <Trash2 className="size-3.5" />
              Delete {label}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
