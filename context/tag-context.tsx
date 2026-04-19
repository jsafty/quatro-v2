"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Tag } from "@/types/tag";

type TagContextValue = {
  tags: Tag[];
  loading: boolean;
  selectedTagIds: string[];
  toggleTagFilter: (id: string) => void;
  clearTagFilter: () => void;
  createTag: (name: string, color: string) => Promise<string | null>;
  deleteTag: (id: string) => Promise<void>;
};

const TagContext = createContext<TagContextValue | null>(null);

export function TagProvider({ children }: { children: React.ReactNode }) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const supabase = createClient();

  const fetchTags = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (data) {
      setTags(data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        color: row.color,
        createdAt: row.created_at,
      })));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  function toggleTagFilter(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function clearTagFilter() {
    setSelectedTagIds([]);
  }

  // Returns the new tag's ID so the caller can immediately assign it
  async function createTag(name: string, color: string): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const id = crypto.randomUUID();
    const { error } = await supabase.from("tags").insert({
      id,
      user_id: user.id,
      name,
      color,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("createTag failed:", error);
      toast.error("Failed to create tag.");
      return null;
    }

    await fetchTags();
    return id;
  }

  async function deleteTag(id: string) {
    await supabase.from("tags").delete().eq("id", id);
    // Remove from active filter if it was selected
    setSelectedTagIds((prev) => prev.filter((x) => x !== id));
    await fetchTags();
  }

  return (
    <TagContext.Provider
      value={{ tags, loading, selectedTagIds, toggleTagFilter, clearTagFilter, createTag, deleteTag }}
    >
      {children}
    </TagContext.Provider>
  );
}

export function useTags() {
  const ctx = useContext(TagContext);
  if (!ctx) throw new Error("useTags must be used within a TagProvider");
  return ctx;
}
