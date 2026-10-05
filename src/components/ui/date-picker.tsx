"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  id?: string;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
}

interface Position { left: number; top: number; width: number; maxHeight: number }

const pad = (value: number) => String(value).padStart(2, "0");
const toValue = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const bangkokTodayValue = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};
const fromValue = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day);
  return toValue(date) === value ? date : undefined;
};
const sameDay = (left: Date, right: Date) => left.toDateString() === right.toDateString();

export function DatePicker({
  name,
  value,
  defaultValue = "",
  onValueChange,
  id,
  className,
  placeholder = "Choose date",
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const generatedId = useId();
  const pickerId = id ?? generatedId;
  const panelId = `${pickerId}-calendar`;
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = controlled ? value : internalValue;
  const selectedDate = selectedValue ? fromValue(selectedValue) : undefined;
  const today = fromValue(bangkokTodayValue()) ?? new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = fromValue(selectedValue);
    const now = fromValue(bangkokTodayValue()) ?? new Date();
    return new Date(initial?.getFullYear() ?? now.getFullYear(), initial?.getMonth() ?? now.getMonth(), 1);
  });
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [focusedDate, setFocusedDate] = useState(() => selectedValue || bangkokTodayValue());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(Math.max(rect.width, 288), window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const openAbove = below < 400 && above > below;
    const available = openAbove ? above : below;
    const maxHeight = Math.max(120, Math.min(440, available));
    const top = openAbove
      ? Math.max(12, rect.top - maxHeight - 6)
      : Math.min(rect.bottom + 6, window.innerHeight - maxHeight - 12);
    setPosition({ left, top, width, maxHeight });
  }, []);

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    setPosition(null);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    document.getElementById(`${panelId}-day-${focusedDate}`)?.focus();
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [close, focusedDate, open, panelId, updatePosition]);

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const first = new Date(year, month, 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const dayCount = new Date(year, month + 1, 0).getDate();
    const cellCount = Math.ceil((mondayOffset + dayCount) / 7) * 7;
    return Array.from({ length: cellCount }, (_, index) => new Date(year, month, index - mondayOffset + 1));
  }, [visibleMonth]);

  const selectDate = (date: Date) => {
    const nextValue = toValue(date);
    if (!controlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    close(true);
  };

  const clearDate = () => {
    if (!controlled) setInternalValue("");
    onValueChange?.("");
    close(true);
  };

  const changeMonth = (offset: number) => {
    const focused = fromValue(focusedDate) ?? today;
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
    const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
    const nextDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(focused.getDate(), lastDay));
    setVisibleMonth(nextMonth);
    setFocusedDate(toValue(nextDate));
  };

  const moveFocus = (date: Date) => {
    setFocusedDate(toValue(date));
    if (date.getMonth() !== visibleMonth.getMonth() || date.getFullYear() !== visibleMonth.getFullYear()) {
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const monthLabel = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(visibleMonth);
  const displayLabel = selectedDate
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(selectedDate)
    : placeholder;

  return (
    <>
      <input type="hidden" name={name} value={selectedValue} />
      <button
        ref={triggerRef}
        id={pickerId}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          if (open) close();
          else {
            const initialFocus = fromValue(selectedValue) ?? today;
            setFocusedDate(toValue(initialFocus));
            setVisibleMonth(new Date(initialFocus.getFullYear(), initialFocus.getMonth(), 1));
            updatePosition();
            setOpen(true);
          }
        }}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-input bg-background px-3 text-left text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
          !selectedDate && "text-muted-foreground",
          className,
        )}
      >
        <span className="min-w-0 flex-1 truncate">{displayLabel}</span>
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
      {open && position && typeof document !== "undefined" && createPortal(
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Choose a date"
          className="fixed z-[100] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-lg ring-1 ring-black/5 sm:p-4"
          style={{ left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight }}
        >
          <header className="flex items-center justify-between gap-2">
            <h2 className="min-w-0 truncate text-sm font-semibold text-foreground">{monthLabel}</h2>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><ChevronLeft className="size-4" /></button>
              <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><ChevronRight className="size-4" /></button>
            </div>
          </header>
          <div className="mt-2 grid grid-cols-7" aria-hidden="true">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day} className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground">{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1" role="group" aria-label={monthLabel}>
            {calendarDays.map((date) => {
              const inMonth = date.getMonth() === visibleMonth.getMonth();
              const isSelected = selectedDate ? sameDay(date, selectedDate) : false;
              const isToday = sameDay(date, today);
              const dayLabel = new Intl.DateTimeFormat("en-GB", { dateStyle: "full" }).format(date);
              return (
                <button
                  key={toValue(date)}
                  id={`${panelId}-day-${toValue(date)}`}
                  type="button"
                  aria-label={dayLabel}
                  aria-pressed={isSelected}
                  tabIndex={toValue(date) === focusedDate ? 0 : -1}
                  onKeyDown={(event) => {
                    const delta = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" ? -7 : event.key === "ArrowDown" ? 7 : 0;
                    if (delta) {
                      event.preventDefault();
                      moveFocus(new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta));
                    } else if (event.key === "Home" || event.key === "End") {
                      event.preventDefault();
                      const mondayIndex = (date.getDay() + 6) % 7;
                      moveFocus(new Date(date.getFullYear(), date.getMonth(), date.getDate() + (event.key === "Home" ? -mondayIndex : 6 - mondayIndex)));
                    } else if (event.key === "PageUp" || event.key === "PageDown") {
                      event.preventDefault();
                      changeMonth(event.key === "PageUp" ? -1 : 1);
                    }
                  }}
                  onClick={() => selectDate(date)}
                  className={cn(
                    "mx-auto flex size-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    !inMonth && "text-muted-foreground/50",
                    inMonth && !isSelected && "text-foreground hover:bg-muted",
                    isToday && !isSelected && "font-semibold text-primary ring-1 ring-primary/35",
                    isSelected && "bg-primary font-semibold text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <footer className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
            <button type="button" onClick={clearDate} className="min-h-10 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Clear</button>
            <button type="button" onClick={() => selectDate(today)} className="min-h-10 rounded-lg px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Today</button>
          </footer>
        </div>,
        document.body,
      )}
    </>
  );
}
