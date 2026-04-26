"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTasks } from "@/context/task-context";
import { TaskSearchSelect } from "@/components/task-search-select";
import { SubtaskList } from "@/components/subtask-list";
import type { Subtask } from "@/types/subtask";
import { useTags } from "@/context/tag-context";
import { DateTimePicker } from "@/components/date-time-picker";
import { RecurrencePicker } from "@/components/recurrence-picker";

const TAG_COLORS = [
  { value: "#077ec0", label: "Blue" },
  { value: "#57c7e4", label: "Sky" },
  { value: "#263573", label: "Navy" },
  { value: "#2d8a4e", label: "Green" },
  { value: "#e53e3e", label: "Red" },
  { value: "#f6891f", label: "Orange" },
  { value: "#be3192", label: "Pink" },
];

export function AddTaskDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");

  const [blockedBy, setBlockedBy] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [creatingTag, setCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);
  const [savingTag, setSavingTag] = useState(false);
  const [pendingSubtasks, setPendingSubtasks] = useState<Subtask[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { createTask, tasks } = useTasks();
  const { tags, createTag } = useTags();
  const incompleteTasks = tasks.filter((t) => !t.completedAt);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== " ") return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement).isContentEditable) return;
      e.preventDefault();
      setOpen(true);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function reset() {
    setTitle("");
    setDescription("");
    setStartDate("");

    setBlockedBy("");
    setRecurrence("");
    setPendingSubtasks([]);
    setSelectedTagIds([]);
    setCreatingTag(false);
    setNewTagName("");
    setNewTagColor(TAG_COLORS[0].value);
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleCreateTag() {
    if (!newTagName.trim() || savingTag) return;
    setSavingTag(true);
    const newId = await createTag(newTagName.trim(), newTagColor);
    if (newId) setSelectedTagIds((prev) => [...prev, newId]);
    setNewTagName("");
    setNewTagColor(TAG_COLORS[0].value);
    setCreatingTag(false);
    setSavingTag(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    await createTask({
      title: title.trim(),
      description: description.trim() || null,
      startDate: startDate || null,
      dueDate: null,
      blockedBy: blockedBy || null,
      recurrence: recurrence || null,
      tagIds: selectedTagIds,
      subtaskTitles: pendingSubtasks.map((s) => s.title).filter(Boolean),
    });
    setOpen(false);
    reset();
    setSubmitting(false);
  }

  const inputClass = "bg-muted border-0 focus-visible:ring-1 focus-visible:ring-quatro-blue rounded-lg text-sm";
  const labelClass = "text-sm font-semibold text-primary";

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      {/* Desktop button */}
      <DialogTrigger className="hidden md:inline-flex items-center gap-2 bg-primary hover:bg-quatro-blue text-white font-bold rounded-lg px-4 py-2 text-sm transition-colors cursor-pointer">
        <Plus size={16} />
        Add task
      </DialogTrigger>

      {/* Mobile FAB */}
      <DialogTrigger className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-primary hover:bg-quatro-blue text-white rounded-full shadow-lg flex items-center justify-center transition-colors cursor-pointer">
        <Plus size={24} strokeWidth={2.5} />
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-2rem)] sm:w-auto sm:max-w-md rounded-2xl overflow-hidden box-border">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl font-bold">New task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="task-title" className={labelClass}>
              Summary <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to get done?"
              required
              autoFocus
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5 min-w-0 overflow-hidden">
            <Label htmlFor="task-desc" className={labelClass}>Description</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional context…"
              rows={2}
              className={`${inputClass} resize-none w-full max-w-full break-all whitespace-pre-wrap box-border`}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Sub-tasks</Label>
            <div className="bg-muted rounded-lg px-3 py-2">
              <SubtaskList
                subtasks={pendingSubtasks}
                onToggle={() => {}}
                onDelete={(id) => setPendingSubtasks((prev) => prev.filter((s) => s.id !== id))}
                onUpdate={(id, title) =>
                  setPendingSubtasks((prev) =>
                    prev.map((s) => (s.id === id ? { ...s, title } : s))
                  )
                }
                onAdd={(title) =>
                  setPendingSubtasks((prev) => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      taskId: "",
                      title,
                      completedAt: null,
                      position: prev.length,
                      createdAt: new Date().toISOString(),
                    },
                  ])
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Start date</Label>
            <DateTimePicker
              value={startDate || null}
              onChange={(v) => { setStartDate(v ?? ""); if (!v) setRecurrence(""); }}
              placeholder="Not scheduled"
            />
            {startDate && (
              <select
                value={new Date(startDate).getHours()}
                onChange={(e) => {
                  const d = new Date(startDate);
                  d.setHours(Number(e.target.value), 0, 0, 0);
                  setStartDate(d.toISOString());
                }}
                className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-quatro-blue"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const h12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
                  const ampm = i < 12 ? "AM" : "PM";
                  return <option key={i} value={i}>{h12}:00 {ampm}</option>;
                })}
              </select>
            )}
            <RecurrencePicker
              value={recurrence}
              onChange={setRecurrence}
              disabled={!startDate}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-blocked" className={labelClass}>Blocked by</Label>
            <TaskSearchSelect
              id="task-blocked"
              tasks={incompleteTasks}
              value={blockedBy}
              onChange={setBlockedBy}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Tags</Label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                {tags.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id);
                  return selected ? (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: tag.color + "33", color: tag.color }}
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className="hover:opacity-70 transition-opacity"
                        aria-label={`Remove ${tag.name}`}
                      >
                        <X size={10} strokeWidth={2.5} />
                      </button>
                    </span>
                  ) : (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border border-dashed transition-opacity hover:opacity-70"
                      style={{ borderColor: tag.color + "88", color: tag.color }}
                    >
                      <Plus size={10} strokeWidth={2.5} />
                      {tag.name}
                    </button>
                  );
                })}
                {!creatingTag && (
                  <button
                    type="button"
                    onClick={() => setCreatingTag(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-quatro-blue hover:text-quatro-blue transition-colors"
                  >
                    <Plus size={10} strokeWidth={2.5} />
                    New tag
                  </button>
                )}
              </div>

              {creatingTag && (
                <div className="bg-muted rounded-lg p-3 space-y-2.5">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tag name"
                    autoFocus
                    maxLength={24}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleCreateTag(); }
                      if (e.key === "Escape") { setCreatingTag(false); setNewTagName(""); }
                    }}
                    className="w-full bg-white rounded-md px-3 py-1.5 text-sm text-primary border-0 focus:outline-none focus:ring-1 focus:ring-quatro-blue"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {TAG_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setNewTagColor(c.value)}
                          className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                          style={{
                            backgroundColor: c.value,
                            outline: newTagColor === c.value ? `2px solid ${c.value}` : "none",
                            outlineOffset: "2px",
                          }}
                          aria-label={c.label}
                        />
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setCreatingTag(false); setNewTagName(""); }}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateTag}
                        disabled={!newTagName.trim() || savingTag}
                        className="text-xs font-bold text-primary hover:text-quatro-blue transition-colors disabled:opacity-40"
                      >
                        {savingTag ? "Saving…" : "Create"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="px-4 py-2 text-sm font-bold bg-primary hover:bg-quatro-blue text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding…" : "Add task"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
