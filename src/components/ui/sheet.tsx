"use client";

import * as React from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

export const Sheet: React.FC<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}> = ({ open: controlledOpen, onOpenChange: controlledOnOpenChange, children }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const onOpenChange = controlledOnOpenChange || setUncontrolledOpen;

  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
};

export const SheetTrigger: React.FC<{
  children?: React.ReactNode;
  render?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, render, className, onClick }) => {
  const ctx = React.useContext(SheetContext);

  const handleClick = () => {
    onClick?.();
    ctx?.onOpenChange(true);
  };

  if (render && React.isValidElement(render)) {
    return React.cloneElement(render as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void; className?: string; children?: React.ReactNode }>, {
      onClick: handleClick,
      className: cn((render.props as { className?: string }).className, className),
      children,
    });
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
};

export const SheetContent: React.FC<{
  children: React.ReactNode;
  className?: string;
  side?: "right" | "left" | "bottom";
}> = ({ children, className, side = "right" }) => {
  const ctx = React.useContext(SheetContext);
  if (!ctx) return null;

  return (
    <AnimatePresence>
      {ctx.open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => ctx.onOpenChange(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Slide-over panel */}
          <motion.div
            initial={side === "bottom" ? { y: "100%" } : { x: side === "right" ? "100%" : "-100%" }}
            animate={side === "bottom" ? { y: 0 } : { x: 0 }}
            exit={side === "bottom" ? { y: "100%" } : { x: side === "right" ? "100%" : "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className={cn(
              "fixed z-50 flex flex-col bg-popover text-popover-foreground shadow-2xl",
              side === "bottom"
                ? "inset-x-0 bottom-0 max-h-[90dvh] w-full border-t border-border"
                : "inset-y-0 w-full max-w-md border-border",
              side === "right" ? "right-0 border-l" : side === "left" ? "left-0 border-r" : "",
              className,
            )}
          >
            <button
              type="button"
              onClick={() => ctx.onOpenChange(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer z-10"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </button>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const SheetHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn("flex flex-col gap-1.5 p-6 border-b border-border/50", className)} {...props} />
);

export const SheetTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3 className={cn("font-heading text-lg font-semibold text-foreground tracking-tight", className)} {...props} />
);

export const SheetDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p className={cn("text-xs text-muted-foreground", className)} {...props} />
);

export const SheetFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn("mt-auto flex flex-col gap-2 p-6 border-t border-border/50", className)} {...props} />
);
