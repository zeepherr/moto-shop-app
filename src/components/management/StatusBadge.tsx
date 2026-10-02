import React from "react";

export const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
        isActive
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-muted text-muted-foreground border-border/60"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-muted-foreground"
        }`}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};
