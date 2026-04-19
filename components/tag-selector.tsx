"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useTags } from "@/context/tag-context";
import type { Task } from "@/types/task";

const TAG_COLORS = [
  { value: "#077ec0", label: "Blue" },
  { value: "#57c7e4", label: "Sky" },
  { value: "#263573", label: "Navy" },
  { value: "#2d8a4e", label: "Green" },
  { value: "#e53e3e", label: "Red" },
  { value: "#f6891f", label: "Orange" },
  { value: "#be3192", label: "Pink" },
];

interface TagSelectorProps {
  task: Task;
  onAdd: (tagId: string) => void;
  onRemove: (tagId: string) => void;
}

export function TagSelector({ task, onAdd, onRemove }: TagSelectorProps) {
  const { tags, createTag } = useTags();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(TAG_COLORS[0].value);
  const [saving, setSaving] = useState(false);

  const taskTagIds = new Set(task.tags.map((t) => t.id));
  const availableTags = tags.filter((t) => !taskTagIds.has(t.id));

  async function handleCreate() {
    if (!newName.trim() || saving) return;
    setSaving(true);
    const newId = await createTag(newName.trim(), newColor);
    if (newId) onAdd(newId);
    setNewName("");
    setNewColor(TAG_COLORS[0].value);
    setCreating(false);
    setSaving(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {/* Current task tags — removable */}
        {task.tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: tag.color + "33", color: tag.color }}
          >
            {tag.name}
            <button
              type="button"
              onClick={() => onRemove(tag.id)}
              className="hover:opacity-70 transition-opacity"
              aria-label={`Remove ${tag.name}`}
            >
              <X size={10} strokeWidth={2.5} />
            </button>
          </span>
        ))}

        {/* Available tags — addable */}
        {availableTags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onAdd(tag.id)}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border border-dashed transition-opacity hover:opacity-70"
            style={{ borderColor: tag.color + "88", color: tag.color }}
          >
            <Plus size={10} strokeWidth={2.5} />
            {tag.name}
          </button>
        ))}

        {/* New tag button */}
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-quatro-blue hover:text-quatro-blue transition-colors"
          >
            <Plus size={10} strokeWidth={2.5} />
            New tag
          </button>
        )}
      </div>

      {/* Inline creation form */}
      {creating && (
        <div className="bg-muted rounded-lg p-3 space-y-2.5">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tag name"
            autoFocus
            maxLength={24}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleCreate(); }
              if (e.key === "Escape") { setCreating(false); setNewName(""); }
            }}
            className="w-full bg-white rounded-md px-3 py-1.5 text-sm text-primary border-0 focus:outline-none focus:ring-1 focus:ring-quatro-blue"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {TAG_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNewColor(c.value)}
                  className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.value,
                    outline: newColor === c.value ? `2px solid ${c.value}` : "none",
                    outlineOffset: "2px",
                  }}
                  aria-label={c.label}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setCreating(false); setNewName(""); }}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newName.trim() || saving}
                className="text-xs font-bold text-primary hover:text-quatro-blue transition-colors disabled:opacity-40"
              >
                {saving ? "Saving…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
