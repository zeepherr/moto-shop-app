"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType>({
  open: false,
  onOpenChange: () => {},
});

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children, className }) => {
  if (!open) return null;

  const hasDialogContent = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      typeof child.type === "function" &&
      "displayName" in child.type &&
      child.type.displayName === "DialogContent"
  );

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {hasDialogContent ? (
        children
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => onOpenChange(false)}
          />
          <div
            className={cn(
              "relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl animate-in zoom-in-95 duration-200 z-10 text-card-foreground",
              className
            )}
          >
            {children}
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  const { onOpenChange } = React.useContext(DialogContext);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl animate-in zoom-in-95 duration-200 z-10 text-card-foreground",
          className
        )}
        {...props}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer z-20"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
};
DialogContent.displayName = "DialogContent";

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

export const DialogClose: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const ctx = React.useContext(DialogContext);
  return (
    <button
      type="button"
      onClick={onClose || (() => ctx.onOpenChange(false))}
      className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer z-20"
    >
      <X className="h-4 w-4" />
    </button>
  );
};
