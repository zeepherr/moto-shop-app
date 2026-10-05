"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  id?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

interface MenuPosition {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
}

const OPTION_HEIGHT = 44;
const VIEWPORT_GUTTER = 12;

export function Select({
  options,
  value,
  defaultValue = "",
  onValueChange,
  name,
  id,
  className,
  placeholder = "Select an option",
  disabled = false,
  required = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listboxId = `${selectId}-options`;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = isControlled ? value : internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);
  const enabledOptions = useMemo(() => options.filter((option) => !option.disabled), [options]);
  const isDisabled = disabled || enabledOptions.length === 0;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const typeBufferRef = useRef("");
  const typeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(Math.max(rect.width, 180), viewportWidth - VIEWPORT_GUTTER * 2);
    const left = Math.min(
      Math.max(VIEWPORT_GUTTER, rect.left),
      viewportWidth - width - VIEWPORT_GUTTER,
    );
    const desiredHeight = Math.min(options.length * OPTION_HEIGHT + 8, 288);
    const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_GUTTER;
    const spaceAbove = rect.top - VIEWPORT_GUTTER;
    const shouldOpenAbove = spaceBelow < Math.min(desiredHeight, OPTION_HEIGHT * 2) && spaceAbove > spaceBelow;
    const maxHeight = Math.max(OPTION_HEIGHT, Math.min(288, shouldOpenAbove ? spaceAbove : spaceBelow));
    const height = Math.min(desiredHeight, maxHeight);
    const top = shouldOpenAbove ? Math.max(VIEWPORT_GUTTER, rect.top - height - 6) : rect.bottom + 6;

    setPosition({ left, top, width, maxHeight });
  }, [options.length]);

  const openMenu = useCallback((direction: "first" | "last" = "first") => {
    if (isDisabled) return;
    const selectedIndex = enabledOptions.findIndex((option) => option.value === selectedValue);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : direction === "last" ? enabledOptions.length - 1 : 0);
    updatePosition();
    setOpen(true);
  }, [isDisabled, enabledOptions, selectedValue, updatePosition]);

  const chooseOption = useCallback((option: SelectOption) => {
    if (option.disabled) return;
    if (!isControlled) setInternalValue(option.value);
    onValueChange?.(option.value);
    setOpen(false);
    setPosition(null);
    triggerRef.current?.focus();
  }, [isControlled, onValueChange]);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
        setPosition(null);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setPosition(null);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => () => {
    if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
  }, []);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu(event.key === "ArrowUp" ? "last" : "first");
        return;
      }
      setActiveIndex((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + enabledOptions.length) % enabledOptions.length);
    } else if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End" && open) {
      event.preventDefault();
      setActiveIndex(enabledOptions.length - 1);
    } else if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      const option = enabledOptions[activeIndex];
      if (option) chooseOption(option);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeBufferRef.current += event.key.toLocaleLowerCase();
      if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
      typeTimerRef.current = setTimeout(() => { typeBufferRef.current = ""; }, 600);
      const match = enabledOptions.findIndex((option) => option.label.toLocaleLowerCase().startsWith(typeBufferRef.current));
      if (match >= 0) {
        if (!open) openMenu();
        setActiveIndex(match);
      }
    }
  };

  useEffect(() => {
    if (!open || !menuRef.current) return;
    menuRef.current.querySelector<HTMLElement>(`[data-option-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  return (
    <>
      {name && <input type="hidden" name={name} value={selectedValue} />}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={isDisabled}
        role="combobox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-required={required || undefined}
        aria-activedescendant={open ? `${listboxId}-option-${activeIndex}` : undefined}
        onClick={() => open ? (setOpen(false), setPosition(null)) : openMenu()}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-input bg-background px-3 text-left text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && position && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className="fixed z-[100] overflow-y-auto overscroll-contain rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-black/5"
          style={{ left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight }}
        >
          {options.map((option, renderedIndex) => {
            const optionIndex = enabledOptions.findIndex((item) => item.value === option.value);
            const isSelected = option.value === selectedValue;
            return (
              <div
                key={option.value}
                id={option.disabled ? `${listboxId}-disabled-${renderedIndex}` : `${listboxId}-option-${optionIndex}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                data-option-index={optionIndex}
                onPointerMove={() => !option.disabled && setActiveIndex(optionIndex)}
                onClick={() => chooseOption(option)}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm transition-colors",
                  option.disabled && "cursor-not-allowed opacity-45",
                  !option.disabled && optionIndex === activeIndex && "bg-muted text-foreground",
                  isSelected && "bg-primary/10 font-semibold text-primary",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {isSelected && <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />}
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
