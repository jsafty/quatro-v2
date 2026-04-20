"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { useTags } from "@/context/tag-context";

export function MobileFilterTrigger() {
  const [open, setOpen] = useState(false);
  const { tags, selectedTagIds, toggleTagFilter, clearTagFilter } = useTags();
  const activeCount = selectedTagIds.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden relative flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
        aria-label="Filter tasks"
      >
        <SlidersHorizontal size={18} />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {open && createPortal(
        <>
          <div
            className="fixed inset-0 z-[150] bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-[200] bg-white rounded-t-2xl"
            style={{ animation: "mobileSheetUp 0.25s ease forwards" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <h3 className="text-base font-bold text-primary">Filter by tag</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tag list */}
            <div className="px-4 overflow-y-auto max-h-[50vh]">
              {tags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No tags yet. Create tags when adding or editing a task.
                </p>
              ) : (
                <div className="space-y-1 pb-2">
                  {tags.map((tag) => {
                    const active = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTagFilter(tag.id)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors hover:bg-muted"
                      >
                        <div
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="flex-1 text-left text-sm font-semibold text-primary">
                          {tag.name}
                        </span>
                        {active && (
                          <Check size={16} className="text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 pt-3 pb-8 border-t border-border flex gap-3">
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={() => { clearTagFilter(); setOpen(false); }}
                  className="flex-1 py-2.5 text-sm font-semibold text-muted-foreground border border-border rounded-xl hover:text-primary transition-colors"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 text-sm font-bold bg-primary text-white rounded-xl hover:bg-quatro-blue transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

export function MobileFilterPills() {
  const { tags, selectedTagIds, toggleTagFilter } = useTags();
  const activeTags = tags.filter((t) => selectedTagIds.includes(t.id));

  if (activeTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 md:hidden">
      {activeTags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
          style={{
            backgroundColor: tag.color + "22",
            borderColor: tag.color + "55",
            color: tag.color,
          }}
        >
          {tag.name}
          <button
            type="button"
            onClick={() => toggleTagFilter(tag.id)}
            className="hover:opacity-70 transition-opacity"
            aria-label={`Remove ${tag.name} filter`}
          >
            <X size={10} strokeWidth={2.5} />
          </button>
        </span>
      ))}
    </div>
  );
}
