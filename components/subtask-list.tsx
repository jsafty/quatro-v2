"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Trash2 } from "lucide-react";
import type { Subtask } from "@/types/subtask";

interface SubtaskListProps {
  subtasks: Subtask[];
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, title: string) => void;
  maxVisible?: number;
}

export function SubtaskList({
  subtasks,
  onToggle,
  onDelete,
  onUpdate,
  maxVisible,
}: SubtaskListProps) {
  const [showAll, setShowAll] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editRef = useRef<HTMLInputElement>(null);

  const shown = maxVisible && !showAll ? subtasks.slice(0, maxVisible) : subtasks;
  const hiddenCount = maxVisible ? Math.max(0, subtasks.length - maxVisible) : 0;

  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  function startEdit(sub: Subtask) {
    if (!onUpdate) return;
    setEditingId(sub.id);
    setEditValue(sub.title);
  }

  function commitEdit() {
    if (editingId && editValue.trim()) onUpdate?.(editingId, editValue.trim());
    setEditingId(null);
    setEditValue("");
  }

  return (
    <div className="space-y-0.5" onClick={(e) => e.stopPropagation()}>
      {shown.map((sub) => {
        const done = !!sub.completedAt;
        const isEditing = editingId === sub.id;
        return (
          <div key={sub.id} className="group flex items-center gap-2 py-0.5 min-w-0">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggle(sub.id); }}
              className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                done
                  ? "bg-quatro-blue border-quatro-blue"
                  : "border-muted-foreground/40 hover:border-quatro-blue hover:bg-quatro-blue/10"
              }`}
              aria-label={done ? "Mark incomplete" : "Mark complete"}
            >
              {done && <Check size={8} strokeWidth={3} className="text-white" />}
            </button>

            {isEditing ? (
              <input
                ref={editRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
                  if (e.key === "Escape") { setEditingId(null); setEditValue(""); }
                }}
                className="flex-1 min-w-0 text-sm bg-muted rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-quatro-blue"
              />
            ) : (
              <span
                className={`flex-1 min-w-0 text-sm leading-snug break-words ${
                  done ? "line-through text-muted-foreground" : "text-primary"
                } ${onUpdate ? "cursor-text" : ""}`}
                onClick={() => startEdit(sub)}
              >
                {sub.title}
              </span>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(sub.id); }}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-destructive"
                aria-label="Delete subtask"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        );
      })}

      {hiddenCount > 0 && !showAll && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowAll(true); }}
          className="text-xs text-muted-foreground hover:text-primary transition-colors pl-6 py-0.5"
        >
          +{hiddenCount} more
        </button>
      )}
    </div>
  );
}
