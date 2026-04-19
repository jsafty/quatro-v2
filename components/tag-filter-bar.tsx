"use client";

import { useTags } from "@/context/tag-context";

export function TagFilterBar() {
  const { tags, selectedTagIds, toggleTagFilter, clearTagFilter } = useTags();

  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mb-5">
      {tags.map((tag) => {
        const active = selectedTagIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            onClick={() => toggleTagFilter(tag.id)}
            className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"
            style={
              active
                ? { backgroundColor: tag.color, borderColor: tag.color, color: "#fff" }
                : { backgroundColor: tag.color + "18", borderColor: tag.color + "55", color: tag.color }
            }
          >
            {tag.name}
          </button>
        );
      })}

      {selectedTagIds.length > 0 && (
        <button
          onClick={clearTagFilter}
          className="text-xs font-semibold px-3 py-1 rounded-full text-muted-foreground hover:text-primary transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
