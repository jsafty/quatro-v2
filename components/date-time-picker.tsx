"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Clock, CalendarClock, X } from "lucide-react";

type Step = "presets" | "calendar";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface DateTimePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  iconOnly?: boolean;
}

function formatDisplay(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} at ${time}`;
}

export function DateTimePicker({ value, onChange, placeholder = "None", iconOnly = false }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("presets");

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 256 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setStep("presets");
  }, []);

  function openPicker() {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const dropW = 256;
      const spaceBelow = window.innerHeight - r.bottom;
      const top = spaceBelow >= 280 ? r.bottom + 6 : r.top - 6;
      const left = Math.min(r.left, window.innerWidth - dropW - 8);
      setDropdownStyle({ top, left, width: dropW });
    }
    reset();
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setOpen(false);
        reset();
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, reset]);

  function applyDirect(d: Date) {
    onChange(d.toISOString());
    setOpen(false);
    reset();
  }

  function selectDate(d: Date) {
    const date = new Date(d);
    date.setHours(8, 0, 0, 0);
    applyDirect(date);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  type Cell = { date: Date; inMonth: boolean };
  const cells: Cell[] = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--)
    cells.push({ date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i), inMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(viewYear, viewMonth, d), inMonth: true });
  while (cells.length < 42)
    cells.push({ date: new Date(viewYear, viewMonth + 1, cells.length - firstDayOfMonth - daysInMonth + 1), inMonth: false });

  const todayStr = new Date().toDateString();

  const PRESETS = [
    {
      label: "1 hour from now",
      action() { const d = new Date(); d.setHours(d.getHours() + 1); d.setSeconds(0, 0); applyDirect(d); },
    },
    {
      label: "3 hours from now",
      action() { const d = new Date(); d.setHours(d.getHours() + 3); d.setSeconds(0, 0); applyDirect(d); },
    },
    {
      label: "Tomorrow",
      action() { const d = new Date(); d.setDate(d.getDate() + 1); selectDate(d); },
    },
    {
      label: "Next week",
      action() {
        const d = new Date();
        const daysUntilMonday = (8 - d.getDay()) % 7 || 7;
        d.setDate(d.getDate() + daysUntilMonday);
        selectDate(d);
      },
    },
    {
      label: "Custom",
      action() {
        const n = new Date();
        setViewYear(n.getFullYear());
        setViewMonth(n.getMonth());
        setStep("calendar");
      },
    },
  ];

  return (
    <div className="relative">
      {iconOnly ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={openPicker}
          className={`p-1.5 rounded-lg transition-colors focus:outline-none ${
            value
              ? "text-quatro-blue hover:bg-quatro-blue/10"
              : "text-muted-foreground hover:text-primary hover:bg-muted"
          }`}
          aria-label={value ? `Scheduled: ${formatDisplay(value)}` : "Schedule start date"}
          title={value ? `Scheduled: ${formatDisplay(value)}` : "Schedule start date"}
        >
          <CalendarClock size={15} />
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={openPicker}
          className={`w-full flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm text-left focus:outline-none focus:ring-1 focus:ring-quatro-blue transition-colors ${
            value ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Clock size={14} className="shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate">{formatDisplay(value) || placeholder}</span>
          {value && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <X size={14} />
            </span>
          )}
        </button>
      )}

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[200] bg-white rounded-2xl shadow-xl border border-border overflow-hidden"
          style={{ top: dropdownStyle.top, left: dropdownStyle.left, width: dropdownStyle.width }}
        >
          {step === "presets" && (
            <div className="py-1.5">
              {PRESETS.map(({ label, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={action}
                  className="w-full text-left px-4 py-2.5 text-sm font-semibold text-primary hover:bg-muted transition-colors"
                >
                  {label}
                </button>
              ))}
              {value && (
                <>
                  <div className="my-1 border-t border-border" />
                  <button
                    type="button"
                    onClick={() => { onChange(null); setOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-muted transition-colors"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          )}

          {step === "calendar" && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <ChevronLeft size={15} className="text-primary" />
                </button>
                <span className="text-sm font-bold text-primary">{MONTHS[viewMonth]} {viewYear}</span>
                <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <ChevronRight size={15} className="text-primary" />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((d) => (
                  <span key={d} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {cells.map(({ date, inMonth }, i) => {
                  const isToday = date.toDateString() === todayStr;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectDate(date)}
                      className={`h-8 w-full flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                        !inMonth
                          ? "text-muted-foreground/30 hover:bg-muted"
                          : isToday
                          ? "text-quatro-blue font-bold hover:bg-primary hover:text-white"
                          : "text-primary hover:bg-primary hover:text-white"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setStep("presets")}
                className="mt-2 w-full text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1"
              >
                ← Back
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
