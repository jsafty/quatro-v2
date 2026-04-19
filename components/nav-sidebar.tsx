"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTasks } from "@/context/task-context";
import { useTags } from "@/context/tag-context";
import { CheckSquare, Clock, Lock, CheckCircle, LogOut, Tag, ChevronLeft, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",          label: "Tasks",     icon: CheckSquare, countKey: "actionable" as const },
  { href: "/scheduled", label: "Scheduled", icon: Clock,       countKey: "scheduled"  as const },
  { href: "/blocked",   label: "Blocked",   icon: Lock,        countKey: "blocked"    as const },
  { href: "/completed", label: "Completed", icon: CheckCircle, countKey: null },
];

const TAG_COLORS = ["#077ec0", "#57c7e4", "#2d8a4e", "#e53e3e", "#f6891f", "#be3192", "#263573"];

export function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { top4, backlog, scheduledTasks, blockedTasks } = useTasks();
  const { tags, selectedTagIds, toggleTagFilter, createTag, deleteTag } = useTags();

  const [tagsOpen, setTagsOpen] = useState(true);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const counts = {
    actionable: top4.length + backlog.length,
    scheduled: scheduledTasks.length,
    blocked: blockedTasks.length,
  };

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleAddTag() {
    const name = newTagName.trim();
    if (!name) {
      setAddingTag(false);
      setNewTagName("");
      return;
    }
    const nextColor = TAG_COLORS[tags.length % TAG_COLORS.length];
    setNewTagName("");
    setAddingTag(false);
    await createTag(name, nextColor);
  }

  return (
    <aside className="hidden md:flex flex-col w-52 shrink-0 min-h-screen bg-primary text-white">
      <div className="px-6 py-5 border-b border-white/10">
        <Image
          src="/logo-full-white.png"
          alt="Quatro"
          width={120}
          height={70}
          className="w-auto h-8"
          priority
        />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Main nav items */}
        {NAV_ITEMS.map(({ href, label, icon: Icon, countKey }) => {
          const active = pathname === href;
          const count = countKey ? counts[countKey] : null;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                active
                  ? "bg-white text-primary"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {count != null && count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                    active ? "bg-primary text-white" : "bg-white/20 text-white"
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}

        {/* Tags section */}
        <div className="pt-3">
          <button
            onClick={() => setTagsOpen((o) => !o)}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ChevronLeft
              size={16}
              className="shrink-0 transition-transform duration-200"
              style={{ transform: tagsOpen ? "rotate(-90deg)" : "rotate(0deg)" }}
            />
            <Tag size={16} className="shrink-0" />
            <span className="flex-1 text-left">Tags</span>
          </button>

          {tagsOpen && (
            <div className="mt-0.5 space-y-0.5">
              {tags.map((tag) => {
                const active = selectedTagIds.includes(tag.id);
                return (
                  <div
                    key={tag.id}
                    onClick={() => toggleTagFilter(tag.id)}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      active
                        ? "bg-white text-primary"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 text-sm font-semibold truncate">{tag.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTag(tag.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 hover:bg-white/20"
                      aria-label={`Delete ${tag.name}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}

              {addingTag ? (
                <div className="px-3 py-1.5">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tag name…"
                    autoFocus
                    maxLength={24}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleAddTag(); }
                      if (e.key === "Escape") { setAddingTag(false); setNewTagName(""); }
                    }}
                    onBlur={() => {
                      if (newTagName.trim()) handleAddTag();
                      else { setAddingTag(false); setNewTagName(""); }
                    }}
                    className="w-full bg-transparent text-sm font-semibold text-white placeholder-white/30 outline-none border-b border-white/30 focus:border-white/70 pb-0.5 caret-white transition-colors"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setAddingTag(true)}
                  className="flex items-center px-3 py-2 w-full rounded-lg text-sm font-semibold text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
                >
                  + Add tag
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
