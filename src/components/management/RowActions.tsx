"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleCheck, CircleOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RowActionsProps {
  onEdit: () => void;
  onStatusChange: () => void;
  onDelete: () => void;
  isActive: boolean;
  label?: string;
}

interface MenuPosition {
  left: number;
  top: number;
  placement: "top" | "bottom";
}
export const RowActions: React.FC<RowActionsProps> = ({
  onEdit,
  onStatusChange,
  onDelete,
  isActive,
  label = "item",
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const open = position !== null;
  const closeMenu = () => {
    setPosition(null);
    triggerRef.current?.focus();
  };
  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const menuWidth = 240;
    const menuHeight = 210;
    const gap = 8;
    const placement = window.innerHeight - rect.bottom >= menuHeight ? "bottom" : "top";
    setPosition({
      left: Math.max(12, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12)),
      top: placement === "bottom" ? rect.bottom + gap : rect.top - menuHeight - gap,
      placement,
    });
  };
  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLButtonElement>("[role='menuitem']")?.focus();
    });
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    const handleViewportChange = () => setPosition(null);

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  const runAction = (action: () => void) => {
    setPosition(null);
    action();
  };

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openMenu();
          }
        }}
        className="size-9 rounded-xl p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground cursor-pointer"
        data-state={open ? "open" : "closed"}
        aria-label={`Manage ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal className="size-4.5" />
      </Button>

      {open && position &&
        createPortal(
          <>
            <button className="fixed inset-0 z-40 cursor-default" aria-label="Close actions" onClick={closeMenu} />
            <div
              ref={menuRef}
              role="menu"
              aria-label={`${label} actions`}
              style={{ left: position.left, top: position.top }}
              className={`fixed z-50 w-60 rounded-2xl border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-[0_16px_45px_rgba(0,0,0,0.18)] outline-none animate-in fade-in-0 zoom-in-95 duration-150 ${position.placement === "top" ? "origin-bottom-right" : "origin-top-right"}`}
            >
              <ActionItem icon={Pencil} label={`Edit ${label}`} description="Update details and information" onClick={() => runAction(onEdit)} />
              <ActionItem
                icon={isActive ? CircleOff : CircleCheck}
                label={isActive ? "Deactivate" : "Activate"}
                description={isActive ? "Hide from active workflows" : "Make available to the shop"}
                tone={isActive ? "warning" : "success"}
                onClick={() => runAction(onStatusChange)}
              />
              <div className="my-1 border-t border-border/60" />
              <ActionItem icon={Trash2} label={`Delete ${label}`} description="Permanently remove this record" tone="danger" onClick={() => runAction(onDelete)} />
            </div>
          </>,
          document.body,
        )}
    </>
  );
};

function ActionItem({ icon: Icon, label, description, onClick, tone = "default" }: { icon: typeof Pencil; label: string; description: string; onClick: () => void; tone?: "default" | "warning" | "success" | "danger" }) {
  const tones = {
    default: "text-foreground hover:bg-muted",
    warning: "text-amber-700 hover:bg-amber-500/10 dark:text-amber-400",
    success: "text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400",
    danger: "text-destructive hover:bg-destructive/10",
  };

  return (
    <button type="button" role="menuitem" onClick={onClick} className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tones[tone]}`}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-5">{label}</span>
        <span className="block text-xs leading-4 text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}
