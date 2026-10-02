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
    <div className="p-3 lg:p-4">
      <div className="grid grid-cols-[auto_auto_1fr] gap-2">
        {isEditingPending ? (
          <Button
            type="button"
            variant="outline"
            disabled={!hasItems || isPending}
            onClick={onHold}
            className="gap-2 cursor-pointer h-9 px-3"
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
            className="gap-2 cursor-pointer h-9 px-3"
          >
            <Pause className="size-4" />
            Hold
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          disabled={!hasItems || isPending}
          onClick={isEditingPending ? onCancel : onClear}
          title={isEditingPending ? "Cancel order" : "Clear order"}
          className="size-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
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
          className="w-full cursor-pointer h-9 gap-2"
        >
          <CheckCircle2 className="size-4" />
          {isPending ? "Processing..." : isEditingPending ? "Complete sale" : "Checkout order"}
        </Button>
      </div>
    </div>
  );
};
