"use client";

import { X } from "lucide-react";
import { useTags } from "@/context/tag-context";

export function TagFilterBar() {
  const { tags, selectedTagIds, toggleTagFilter, clearTagFilter } = useTags();
  const activeTags = tags.filter((t) => selectedTagIds.includes(t.id));

  if (activeTags.length === 0) return null;

  return (
    <div className="hidden md:flex items-center gap-2 flex-wrap mb-5">
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

      {activeTags.length > 1 && (
        <button
          onClick={clearTagFilter}
          className="text-xs font-semibold px-3 py-1 rounded-full text-muted-foreground hover:text-primary transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
