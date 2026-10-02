"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl animate-in zoom-in-95 duration-200 z-10 text-card-foreground">
        {children}
      </div>
    </div>
  );
};

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn("flex flex-col space-y-1.5 text-left mb-4", className)} {...props} />
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
);

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p className={cn("text-sm text-muted-foreground mt-1", className)} {...props} />
);

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn("flex items-center justify-end space-x-2 mt-6", className)} {...props} />
);

export const DialogClose: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <button
    type="button"
    onClick={onClose}
    className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
  >
    <X className="h-4 w-4" />
  </button>
);
