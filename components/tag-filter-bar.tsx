"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useTags } from "@/context/tag-context";

const TAG_COLORS = ["#077ec0", "#57c7e4", "#2d8a4e", "#e53e3e", "#f6891f", "#be3192", "#263573"];

export function TagFilterBar() {
  const { tags, selectedTagIds, toggleTagFilter, clearTagFilter, createTag, deleteTag } = useTags();
  const [addingTag, setAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  async function handleAddTag() {
    const name = newTagName.trim();
    if (!name) { setAddingTag(false); setNewTagName(""); return; }
    const nextColor = TAG_COLORS[tags.length % TAG_COLORS.length];
    setNewTagName("");
    setAddingTag(false);
    await createTag(name, nextColor);
  }

  if (tags.length === 0 && !addingTag) return null;

  return (
    <div className="hidden md:flex items-center gap-2 flex-wrap mb-5">
      {tags.map((tag) => {
        const active = selectedTagIds.includes(tag.id);
        return (
          <div key={tag.id} className="relative group inline-flex">
            <button
              onClick={() => toggleTagFilter(tag.id)}
              className="text-xs font-semibold pl-3 pr-6 py-1 rounded-full border transition-colors"
              style={
                active
                  ? { backgroundColor: tag.color, borderColor: tag.color, color: "#fff" }
                  : { backgroundColor: tag.color + "18", borderColor: tag.color + "55", color: tag.color }
              }
            >
              {tag.name}
            </button>
            {/* × delete — always visible on mobile (no hover), hidden on desktop until hover */}
            <button
              onClick={() => deleteTag(tag.id)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:opacity-100"
              style={{ color: active ? "#fff" : tag.color }}
              aria-label={`Delete ${tag.name}`}
            >
              <X size={10} strokeWidth={2.5} />
            </button>
          </div>
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
