"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Clock, CalendarClock, X } from "lucide-react";

type Step = "presets" | "calendar" | "time";

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
  const [fromCalendar, setFromCalendar] = useState(false);

  // Calendar navigation
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  // Time picker state (pending until user confirms)
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const [hour12, setHour12] = useState(8);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");

  // Fixed-position dropdown coords (avoids clipping by dialog overflow-y-auto)
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 256 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setStep("presets");
    setFromCalendar(false);
    setPendingDate(null);
    setHour12(8);
    setMinute(0);
    setAmpm("AM");
  }, []);

  function openPicker() {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const dropW = 256;
      // Flip above if not enough space below
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

  function goToTime(d: Date, fromCal: boolean) {
    setPendingDate(d);
    setFromCalendar(fromCal);
    setHour12(8);
    setMinute(0);
    setAmpm("AM");
    setStep("time");
  }

  function confirmTime() {
    if (!pendingDate) return;
    const d = new Date(pendingDate);
    let h = hour12;
    if (ampm === "AM" && h === 12) h = 0;
    else if (ampm === "PM" && h !== 12) h += 12;
    d.setHours(h, minute, 0, 0);
    onChange(d.toISOString());
    setOpen(false);
    reset();
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  // Build calendar grid (always 6 rows × 7 cols = 42 cells)
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
      action() { const d = new Date(); d.setDate(d.getDate() + 1); goToTime(d, false); },
    },
    {
      label: "Next week",
      action() { const d = new Date(); d.setDate(d.getDate() + 7); goToTime(d, false); },
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
          {/* ── Presets ── */}
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

          {/* ── Calendar ── */}
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
                      onClick={() => goToTime(date, true)}
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

          {/* ── Time picker ── */}
          {step === "time" && pendingDate && (
            <div className="p-4 space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide text-center">
                {pendingDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </p>

              <div className="flex items-center justify-center gap-2">
                <select
                  value={hour12}
                  onChange={(e) => setHour12(Number(e.target.value))}
                  className="bg-muted rounded-lg px-2 py-2 text-sm font-bold text-primary outline-none focus:ring-1 focus:ring-quatro-blue cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-lg font-bold text-primary select-none">:</span>
                <select
                  value={minute}
                  onChange={(e) => setMinute(Number(e.target.value))}
                  className="bg-muted rounded-lg px-2 py-2 text-sm font-bold text-primary outline-none focus:ring-1 focus:ring-quatro-blue cursor-pointer"
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                  ))}
                </select>
                <div className="flex rounded-lg overflow-hidden border border-border">
                  {(["AM", "PM"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmpm(p)}
                      className={`px-2.5 py-2 text-xs font-bold transition-colors ${
                        ampm === p ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(fromCalendar ? "calendar" : "presets")}
                  className="flex-1 py-2 text-sm font-semibold text-muted-foreground hover:text-primary border border-border rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={confirmTime}
                  className="flex-1 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-quatro-blue transition-colors"
                >
                  Set
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
