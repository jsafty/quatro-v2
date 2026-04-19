"use client";

import { Repeat } from "lucide-react";

const OPTIONS = [
  { value: "",          label: "Does not repeat" },
  { value: "daily",    label: "Every day" },
  { value: "weekday",  label: "Every weekday" },
  { value: "weekly",   label: "Every week" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly",  label: "Every month" },
];

interface RecurrencePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function RecurrencePicker({ value, onChange, disabled = false }: RecurrencePickerProps) {
  return (
    <div className={`flex items-center gap-2 bg-muted rounded-lg px-3 py-2 transition-opacity ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <Repeat size={14} className="shrink-0 text-muted-foreground" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex-1 bg-transparent text-sm font-medium text-primary outline-none cursor-pointer disabled:cursor-not-allowed appearance-none"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
