"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
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
import { DateTimePicker } from "@/components/date-time-picker";
import { RecurrencePicker } from "@/components/recurrence-picker";

export function AddTaskDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [blockedBy, setBlockedBy] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { createTask, tasks } = useTasks();
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
    setDueDate("");
    setBlockedBy("");
    setRecurrence("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    await createTask({
      title: title.trim(),
      description: description.trim() || null,
      startDate: startDate || null,
      dueDate: dueDate || null,
      blockedBy: blockedBy || null,
      recurrence: recurrence || null,
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
            <Label className={labelClass}>Start date</Label>
            <DateTimePicker
              value={startDate || null}
              onChange={(v) => { setStartDate(v ?? ""); if (!v) setRecurrence(""); }}
              placeholder="Not scheduled"
            />
            <RecurrencePicker
              value={recurrence}
              onChange={setRecurrence}
              disabled={!startDate}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Due date</Label>
            <DateTimePicker
              value={dueDate || null}
              onChange={(v) => setDueDate(v ?? "")}
              placeholder="No due date"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-blocked" className={labelClass}>Blocked by</Label>
            <select
              id="task-blocked"
              value={blockedBy}
              onChange={(e) => setBlockedBy(e.target.value)}
              className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-quatro-blue"
            >
              <option value="">None</option>
              {incompleteTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
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
