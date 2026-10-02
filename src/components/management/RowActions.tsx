"use client";

import { CircleCheck, CircleOff, Pencil, Trash2 } from "lucide-react";
import { ActionMenu } from "./ActionMenu";

interface RowActionsProps {
  onEdit: () => void;
  onStatusChange: () => void;
  onDelete: () => void;
  isActive: boolean;
  label?: string;
}

export function RowActions({
  onEdit,
  onStatusChange,
  onDelete,
  isActive,
  label = "item",
}: RowActionsProps) {
  return (
    <ActionMenu
      label={label}
      items={[
        { label: `Edit ${label}`, icon: Pencil, onSelect: onEdit },
        {
          label: isActive ? "Deactivate" : "Activate",
          icon: isActive ? CircleOff : CircleCheck,
          tone: isActive ? "warning" : "success",
          onSelect: onStatusChange,
        },
        {
          label: `Delete ${label}`,
          icon: Trash2,
          tone: "danger",
          separatorBefore: true,
          onSelect: onDelete,
        },
      ]}
    />
  );
}
