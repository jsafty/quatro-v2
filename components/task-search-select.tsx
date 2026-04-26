"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import type { Task } from "@/types/task";

interface TaskSearchSelectProps {
  tasks: Task[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export function TaskSearchSelect({ tasks, value, onChange, id }: TaskSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = tasks.find((t) => t.id === value) ?? null;

  const filtered = query.trim()
    ? tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    : tasks;

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function openDropdown() {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function select(taskId: string) {
    onChange(taskId);
    setOpen(false);
    setQuery("");
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={openDropdown}
        className="w-full flex items-center gap-2 bg-muted border-0 rounded-lg px-3 py-2 text-sm text-left focus:outline-none focus:ring-1 focus:ring-quatro-blue"
      >
        <span className={`flex-1 truncate ${selected ? "text-primary" : "text-muted-foreground"}`}>
          {selected ? selected.title : "None"}
        </span>
        {selected ? (
          <X size={14} className="shrink-0 text-muted-foreground hover:text-primary transition-colors" onClick={clear} />
        ) : (
          <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-xl border border-border overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="w-full bg-muted rounded-lg px-3 py-1.5 text-sm text-primary placeholder-muted-foreground outline-none focus:ring-1 focus:ring-quatro-blue"
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => select("")}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                !value ? "font-semibold text-primary bg-muted" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              None
            </button>
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">No tasks match.</p>
            ) : (
              filtered.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => select(t.id)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    t.id === value ? "font-semibold text-primary bg-muted" : "text-primary hover:bg-muted"
                  }`}
                >
                  {t.title}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
