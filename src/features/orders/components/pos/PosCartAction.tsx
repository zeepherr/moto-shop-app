"use client";

import React from "react";
import { CheckCircle2, Pause, Save, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PosCartActionsProps {
  hasItems: boolean;
  canComplete: boolean;
  onHold: () => void;
  onClear: () => void;
  onComplete: () => void;
  isPending?: boolean;
  isEditingPending?: boolean;
  onCancel?: () => void;
}

export const PosCartActions: React.FC<PosCartActionsProps> = ({
  hasItems,
  canComplete,
  onHold,
  onClear,
  onComplete,
  isPending = false,
  isEditingPending = false,
  onCancel,
}) => {
  return (
    <div className="p-2 sm:p-3 lg:p-4">
      <div className="grid grid-cols-[minmax(0,0.9fr)_44px_minmax(0,1.3fr)] gap-1.5 sm:grid-cols-[auto_auto_1fr] sm:gap-2">
        {isEditingPending ? (
          <Button
            type="button"
            variant="outline"
            disabled={!hasItems || isPending}
            onClick={onHold}
            className="h-11 min-w-0 cursor-pointer gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
          >
            <Save className="size-4" />
            Update
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={!hasItems || isPending}
            onClick={onHold}
            className="h-11 min-w-0 cursor-pointer gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
          >
            <Pause className="size-4" />
            {isPending ? "Saving…" : "Hold"}
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          disabled={!hasItems || isPending}
          onClick={isEditingPending ? onCancel : onClear}
          title={isEditingPending ? "Cancel order" : "Clear order"}
          aria-label={isEditingPending ? "Cancel order" : "Clear order"}
          className="size-11 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
        >
          {isEditingPending ? (
            <XCircle className="size-4" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </Button>

        <Button
          type="button"
          disabled={!canComplete || isPending}
          onClick={onComplete}
          className="h-11 w-full min-w-0 cursor-pointer gap-1.5 px-2 text-xs sm:gap-2 sm:px-4 sm:text-sm"
        >
          <CheckCircle2 className="size-4" />
          <span className="sm:hidden">{isPending ? "Working…" : "Pay"}</span>
          <span className="hidden sm:inline">
            {isPending ? "Processing..." : isEditingPending ? "Complete sale" : "Checkout order"}
          </span>
        </Button>
      </div>
    </div>
  );
};
