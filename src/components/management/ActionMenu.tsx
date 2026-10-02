"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EllipsisVertical, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ActionMenuItem {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  tone?: "default" | "success" | "warning" | "danger";
  separatorBefore?: boolean;
}

interface ActionMenuProps {
  label: string;
  items: ActionMenuItem[];
  disabled?: boolean;
}

export function ActionMenu({ label, items, disabled = false }: ActionMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number; above: boolean } | null>(null);
  const open = position !== null;

  const close = (restoreFocus = false) => {
    setPosition(null);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const show = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = 196;
    const height = items.length * 40 + 21;
    const above = window.innerHeight - rect.bottom < height + 12;
    setPosition({
      left: Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)),
      top: above ? Math.max(12, rect.top - height - 8) : rect.bottom + 8,
      above,
    });
  };

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => menuRef.current?.querySelector<HTMLButtonElement>("[role='menuitem']")?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const dismiss = () => close();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [open]);

  const tones = {
    default: "text-popover-foreground hover:bg-muted",
    success: "text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400",
    warning: "text-amber-700 hover:bg-amber-500/10 dark:text-amber-400",
    danger: "text-destructive hover:bg-destructive/10",
  };

  return (
    <>
      <Button ref={triggerRef} type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => (open ? close(true) : show())} className="size-8 rounded-lg border border-transparent p-0 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground data-[state=open]:border-border data-[state=open]:bg-muted data-[state=open]:text-foreground" data-state={open ? "open" : "closed"} aria-label={`Open actions for ${label}`} aria-haspopup="menu" aria-expanded={open}>
        <EllipsisVertical className="size-4" />
      </Button>

      {open && position && createPortal(
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close actions" onClick={() => close(true)} />
          <div ref={menuRef} role="menu" aria-label={`${label} actions`} style={{ left: position.left, top: position.top }} className={`fixed z-50 w-[196px] rounded-xl border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-[0_14px_36px_rgba(0,0,0,0.18)] outline-none animate-in fade-in-0 zoom-in-95 duration-150 ${position.above ? "origin-bottom-right" : "origin-top-right"}`}>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={item.separatorBefore ? "mt-1 border-t border-border/60 pt-1" : undefined}>
                  <button type="button" role="menuitem" onClick={() => { close(); item.onSelect(); }} className={`flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tones[item.tone ?? "default"]}`}>
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
